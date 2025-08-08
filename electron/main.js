import { app, BrowserWindow, ipcMain, dialog, globalShortcut } from "electron";
import path from "path";
import { initialize, enable } from "@electron/remote/main/index.js";
import { fileURLToPath } from "url";
import { MongoClient } from "mongodb";
import { spawn } from "child_process";
import fs from "fs";
import os from "os"; // <-- added
import { MongoMemoryServer } from "mongodb-memory-server";

initialize(); // Initializes the remote module

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_NAME = "BusSortingDB";
const DB_PORT = 27017;
const DB_HOST = "127.0.0.1";

let mainWindow;
let mongodProcess;
let mongoServer;
let client;
let db;

async function startMongoDB() {
  try {
    if (process.env.NODE_ENV === "development") {
      mongoServer = await MongoMemoryServer.create({
        instance: {
          port: DB_PORT,
          ip: DB_HOST,
        },
      });
      const uri = mongoServer.getUri();
      console.log("MongoMemoryServer started at:", uri);
      return uri;
    } else {
      await app.whenReady();

      const mongodPath = path.join(
        process.resourcesPath,
        "mongodb",
        "bin",
        process.platform === "win32" ? "mongod.exe" : "mongod"
      );

      if (!fs.existsSync(mongodPath)) {
        throw new Error(`mongod binary not found at: ${mongodPath}`);
      }

      // Try userData path first
      let dbPath = app.getPath("userData");

      try {
        fs.accessSync(dbPath, fs.constants.W_OK);
      } catch (err) {
        // Fallback to OS temp directory if userData is not writable
        const fallbackPath = path.join(os.tmpdir(), "BusSortingDBData");
        if (!fs.existsSync(fallbackPath)) {
          fs.mkdirSync(fallbackPath, { recursive: true });
        }
        console.warn(
          `UserData path not writable (${dbPath}). Falling back to temp directory: ${fallbackPath}`
        );
        dbPath = fallbackPath;
      }

      // Make sure dbPath exists
      if (!fs.existsSync(dbPath)) {
        fs.mkdirSync(dbPath, { recursive: true });
        console.log(`Created DB directory at: ${dbPath}`);
      }

      mongodProcess = spawn(mongodPath, [
        "--dbpath",
        dbPath,
        "--bind_ip",
        DB_HOST,
        "--port",
        DB_PORT,
        "--quiet",
      ]);

      mongodProcess.stdout.on("data", (data) => {
        console.log(`MongoDB: ${data}`);
      });

      mongodProcess.stderr.on("data", (data) => {
        console.error(`MongoDB Error: ${data}`);
      });

      mongodProcess.on("error", (err) => {
        console.error("MongoDB process error:", err);
      });

      mongodProcess.on("exit", (code) => {
        console.log(`MongoDB process exited with code ${code}`);
      });

      console.log(`MongoDB started with DB path: ${dbPath}`);

      return `mongodb://${DB_HOST}:${DB_PORT}`;
    }
  } catch (err) {
    console.error("Failed to start MongoDB:", err);
    throw new Error(`MongoDB startup failed: ${err.message}`);
  }
}

async function connectDB() {
  try {
    const uri = await startMongoDB();
    client = new MongoClient(uri, {
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
    });

    await client.connect();
    db = client.db(DB_NAME);
    console.log(`Connected to database "${DB_NAME}" at ${uri}`);

    // Create collections if they don't exist
    await db.createCollection("routes").catch(() => {}); // ignore if exists
    await db.createCollection("buses").catch(() => {});
    await db.createCollection("morningShift").catch(() => {});
    await db.createCollection("dayShift").catch(() => {});
    console.log("Collections created/verified");

    return true;
  } catch (err) {
    console.error("Database connection failed:", err);
    return false;
  }
}

function createWindow() {
  globalShortcut.register("Control+Shift+I", () => {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow) {
      focusedWindow.webContents.toggleDevTools();
    }
  });

  const win = new BrowserWindow({
    width: 1920,
    height: 1080,
    autoHideMenuBar: true,
    // titleBarOverlay: {
    //   color: '#ffffff',           // ✅ White top bar
    //   symbolColor: '#000000',     // ✅ Black icons (close/minimize/max)
    //   height: 30
    // },
    // titleBarStyle: 'hidden', 
    icon: path.join(__dirname, "../src/assets/bcpsc.png"),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
    show: false,
  });

  if (process.env.NODE_ENV === "development") {
    win.loadURL("http://localhost:5173");
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  win.once("ready-to-show", () => win.show());
  return win;
}

function cleanup() {
  return new Promise(async (resolve) => {
    try {
      if (client) {
        await client.close();
        console.log("MongoDB client disconnected");
      }
      if (mongoServer) {
        await mongoServer.stop();
        console.log("MongoMemoryServer stopped");
      }
      if (mongodProcess) {
        mongodProcess.kill();
        console.log("MongoDB process stopped");
      }
    } catch (err) {
      console.error("Cleanup error:", err);
    } finally {
      resolve();
    }
  });
}

// 🟢 App ready
app.whenReady().then(async () => {
  try {
    const dbConnected = await connectDB();
    if (!dbConnected) throw new Error("Database connection failed");

    // Register IPC handlers (routes, buses, updates, deletes etc.)
    ipcMain.handle("fetch-routes-morning", async () => {
      try {
        const routes = await db.collection("morningShift").find({}).toArray();
        return { data: routes };
      } catch (err) {
        console.error("Error fetching morning routes:", err);
        return { data: [], error: err.message };
      }
    });

    ipcMain.handle("update-route-morning", async (event, data) => {
      try {
        const result = await db.collection("morningShift").updateOne(
          { name: data.name },
          {
            $set: {
              stands: data.stands,
              totalBoys: data.totalBoys,
            },
          }
        );
        return { success: result.modifiedCount > 0 };
      } catch (err) {
        console.error("Error updating morning route:", err);
        return { success: false, error: err.message };
      }
    });

    ipcMain.handle("delete-route-morning", async (event, routeName) => {
      try {
        const result = await db
          .collection("morningShift")
          .deleteOne({ name: routeName });
        return { success: result.deletedCount > 0 };
      } catch (err) {
        console.error("Error deleting morning route:", err);
        return { success: false, error: err.message };
      }
    });

    ipcMain.handle("insert-route-morning", async (event, newRoute) => {
      try {
        const result = await db.collection("morningShift").insertOne(newRoute);
        return { success: true, id: result.insertedId };
      } catch (err) {
        console.error("Error inserting route:", err);
        throw err;
      }
    });

    ipcMain.handle("insert-route-morning-dummy", async (event, newRoute) => {
      try {
        await db.collection("morningShift").deleteMany({});
        const result = await db.collection("morningShift").insertMany(newRoute);
        return { success: true, insertedCount: result.insertedCount };
      } catch (err) {
        console.error("Error inserting route:", err);
        throw err;
      }
    });

    ipcMain.handle("insert-route-dummy", async (event, newRoute) => {
      try {
        await db.collection("dayShift").deleteMany({});
        const result = await db.collection("dayShift").insertMany(newRoute);
        return { success: true, insertedCount: result.insertedCount };
      } catch (err) {
        console.error("Error inserting route:", err);
        throw err;
      }
    });

    ipcMain.handle("insert-bus-dummy", async (event, busData) => {
      try {
        await db.collection("buses").deleteMany({});
        const result = await db.collection("buses").insertMany(busData);
        return { success: true, insertedCount: result.insertedCount };
      } catch (err) {
        console.error("Error inserting bus:", err);
        throw err;
      }
    });

    ipcMain.handle("fetch-routes", async () => {
      try {
        const routes = await db.collection("dayShift").find({}).toArray();
        return { data: routes };
      } catch (err) {
        console.error("Error fetching routes:", err);
        return { data: [] };
      }
    });

    ipcMain.handle("insert-route", async (event, newRoute) => {
      try {
        const result = await db.collection("dayShift").insertOne(newRoute);
        return { success: true, id: result.insertedId };
      } catch (err) {
        console.error("Error inserting route:", err);
        throw err;
      }
    });

    ipcMain.handle("delete-route", async (event, routeName) => {
      try {
        const result = await db
          .collection("dayShift")
          .deleteOne({ name: routeName });
        return { success: result.deletedCount > 0 };
      } catch (err) {
        console.error("Error deleting route:", err);
        throw err;
      }
    });

    ipcMain.handle("fetch-buses", async () => {
      try {
        const buses = await db.collection("buses").find({}).toArray();
        console.log(`Fetched ${buses.length} buses from database`);
        return { data: buses };
      } catch (err) {
        console.error("Error fetching buses:", err);
        return { data: [] };
      }
    });

    ipcMain.handle("insert-bus", async (event, busData) => {
      try {
        const busWithStatus = { ...busData, isActive: true };
        console.log("Inserting bus:", busWithStatus);
        const result = await db.collection("buses").insertOne(busWithStatus);
        return { success: true, id: result.insertedId };
      } catch (err) {
        console.error("Error inserting bus:", err);
        throw err;
      }
    });

    ipcMain.handle("delete-bus", async (event, busNumber) => {
      try {
        console.log("Deleting bus:", busNumber);
        const result = await db
          .collection("buses")
          .deleteOne({ number: busNumber });
        return { success: result.deletedCount > 0 };
      } catch (err) {
        console.error("Error deleting bus:", err);
        throw err;
      }
    });

    ipcMain.handle("update-bus-status", async (event, { number, isActive }) => {
      try {
        console.log(
          `Updating bus status: ${number} to ${
            isActive ? "active" : "inactive"
          }`
        );
        const result = await db
          .collection("buses")
          .updateOne({ number }, { $set: { isActive } });
        return { success: result.modifiedCount > 0 };
      } catch (err) {
        console.error("Error updating bus status:", err);
        throw err;
      }
    });

    global.sharedData = {};

    ipcMain.handle(
      "update-route",
      async (event, { name, stands, totalBoys, totalGirls }) => {
        try {
          // Validate input
          if (!name || !Array.isArray(stands) || 
              typeof totalBoys !== 'number' || 
              typeof totalGirls !== 'number') {
            return { success: false, error: "Invalid input data" };
          }
    
          // Update the route
          const result = await db.collection("dayShift").updateOne(
            { name: name },
            { 
              $set: { 
                stands: stands,
                totalBoys: totalBoys,
                totalGirls: totalGirls,
                updatedAt: new Date() 
              } 
            }
          );
    
          // Check if document was found and updated
          if (result.matchedCount === 0) {
            return { success: false, error: "Route not found" };
          }
    
          return { 
            success: result.modifiedCount > 0,
            matchedCount: result.matchedCount,
            modifiedCount: result.modifiedCount
          };
        } catch (err) {
          console.error("Error updating route:", err);
          return { success: false, error: err.message };
        }
      }
    );
    

    ipcMain.handle("reset-database", async () => {
      try {
        await db.collection("dayShift").deleteMany({});
        await db.collection("morningShift").deleteMany({});
        await db.collection("buses").deleteMany({});
        await db.collection("collegeShift").deleteMany({});
        return { success: true };
      } catch (err) {
        console.error("Error resetting data:", err);
        throw err;
      }
    });

    ipcMain.handle("fetch-routes-college", async () => {
      try {
        const routes = await db.collection("collegeShift").find({}).toArray();
        return { data: routes };
      } catch (err) {
        console.error("Error fetching college routes:", err);
        return { data: [], error: err.message };
      }
    });

    ipcMain.handle("insert-route-college", async (event, newRoute) => {
      try {
        const result = await db.collection("collegeShift").insertOne(newRoute);
        return { success: true, id: result.insertedId };
      } catch (err) {
        console.error("Error inserting college route:", err);
        throw err;
      }
    });

    ipcMain.handle("delete-route-college", async (event, routeName) => {
      try {
        const result = await db.collection("collegeShift").deleteOne({ name: routeName });
        return { success: result.deletedCount > 0 };
      } catch (err) {
        console.error("Error deleting college route:", err);
        return { success: false, error: err.message };
      }
    });

    ipcMain.handle("update-route-college", async (event, { name, stands, totalBoys, totalGirls }) => {
      try {
        const result = await db.collection("collegeShift").updateOne(
          { name },
          {
            $set: {
              stands,
              totalBoys,
              totalGirls,
              updatedAt: new Date()
            }
          }
        );
        return { success: result.modifiedCount > 0 };
      } catch (err) {
        console.error("Error updating college route:", err);
        return { success: false, error: err.message };
      }
    });

    ipcMain.handle("insert-route-college-dummy", async (event, newRoute) => {
      try {
        await db.collection("collegeShift").deleteMany({});
        const result = await db.collection("collegeShift").insertMany(newRoute);
        return { success: true, insertedCount: result.insertedCount };
      } catch (err) {
        console.error("Error inserting college route:", err);
        throw err;
      }
    });

    ipcMain.on("request-assigned-buses", (event) => {
      if (global.sharedData) {
        event.sender.send("assigned-buses-data", global.sharedData);
      }
    });

    console.log("All IPC handlers registered");

    mainWindow = createWindow();
  } catch (err) {
    console.error("Application startup failed:", err);
    dialog.showErrorBox(
      "Startup Error",
      `Failed to start application: ${err.message}`
    );
    await cleanup();
    app.quit();
  }

  ipcMain.on("open-new-window", (event, data) => {
    global.sharedData = data;
    createNewWindow(data);
  });
});

// 🧹 Cleanup events
app.on("window-all-closed", async () => {
  await cleanup();
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on("will-quit", async () => {
  await cleanup();
});

function createNewWindow(data) {
  const newWin = new BrowserWindow({
    width: 1920,
    height: 1080,
    title: "Final Print",
    // frame: false,
    autoHideMenuBar: true,
    // titleBarOverlay: {
    //   color: '#ffffff',           // ✅ White top bar
    //   symbolColor: '#000000',     // ✅ Black icons (close/minimize/max)
    //   height: 30
    // },
    // titleBarStyle: 'hidden', 
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });

  enable(newWin.webContents);

  console.log("Data being sent to new window:", JSON.stringify(data, null, 2));

  if (process.env.NODE_ENV === "development") {
    newWin.loadURL("http://localhost:5173/#/new");
  } else {
    newWin.loadFile(path.join(__dirname, "../dist/index.html"), {
      hash: "/new",
    });
  }

  newWin.webContents.once("did-finish-load", () => {
    setTimeout(() => {
      newWin.webContents.send("assigned-buses-data", data);
    }, 200);
  });
}
