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

      let dbPath = app.getPath("userData");

      try {
        fs.accessSync(dbPath, fs.constants.W_OK);
      } catch (err) {
        const fallbackPath = path.join(os.tmpdir(), "BusSortingDBData");
        if (!fs.existsSync(fallbackPath)) {
          fs.mkdirSync(fallbackPath, { recursive: true });
        }
        console.warn(
          `UserData path not writable (${dbPath}). Falling back to temp directory: ${fallbackPath}`
        );
        dbPath = fallbackPath;
      }

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

    await db.createCollection("routes").catch(() => {});
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

app.whenReady().then(async () => {
  try {
    const dbConnected = await connectDB();
    if (!dbConnected) throw new Error("Database connection failed");

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
          if (!name || !Array.isArray(stands) || 
              typeof totalBoys !== 'number' || 
              typeof totalGirls !== 'number') {
            return { success: false, error: "Invalid input data" };
          }
    
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

    ipcMain.handle("translate-to-bengali", async (event, text) => {
      try {
        const { spawn } = require('child_process');
        const path = require('path');
        const fs = require('fs');
        
        const translatorScript = path.join(process.cwd(), 'translator.py');
        
        if (!fs.existsSync(translatorScript)) {
          console.warn('Translator script not found, using fallback translation');
          return {
            success: false,
            error: 'Translator script not found',
            translatedText: fallbackTranslate(text)
          };
        }
        
        return new Promise((resolve) => {
          const pythonProcess = spawn('python', [translatorScript, text], {
            stdio: ['pipe', 'pipe', 'pipe']
          });

          let output = '';
          let errorOutput = '';

          pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
          });

          pythonProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
          });

          pythonProcess.on('close', (code) => {
            if (code === 0 && output.trim()) {
              resolve({
                success: true,
                translatedText: output.trim()
              });
            } else {
              console.warn('Translation failed, using fallback:', errorOutput);
              resolve({
                success: false,
                error: errorOutput,
                translatedText: fallbackTranslate(text)
              });
            }
          });

          pythonProcess.on('error', (err) => {
            console.warn('Translation process error:', err);
            resolve({
              success: false,
              error: err.message,
              translatedText: fallbackTranslate(text)
            });
          });
        });
        
      } catch (error) {
        console.error('Translation error:', error);
        return {
          success: false,
          error: error.message,
          translatedText: fallbackTranslate(text)
        };
      }
    });

    function fallbackTranslate(text) {
      const translations = {
        'bus': 'বাস',
        'number': 'নম্বর',
        'boys': 'ছেলেদের',
        'girls': 'মেয়েদের',
        'for': 'জন্য',
        'stand': 'স্ট্যান্ড',
        'stands': 'স্ট্যান্ড',
        'morning': 'সকাল',
        'day': 'দিন',
        'college': 'কলেজ',
        'shift': 'শিফট',
        'assignment': 'বরাদ্দ',
        'assignments': 'বরাদ্দ',
        'thank you': 'ধন্যবাদ',
        'no buses': 'কোন বাস নেই',
        'assigned': 'বরাদ্দ করা হয়েছে',
        'has no stands': 'এর জন্য কোন স্ট্যান্ড নেই',
        'bus number': 'বাস নম্বর',
        'morning shift': 'সকালের শিফট',
        'day shift': 'দিনের শিফট',
        'college shift': 'কলেজ শিফট',
        'bus assignments': 'বাস বরাদ্দ'
      };

      let translated = text.toLowerCase();
      
      for (const [english, bengali] of Object.entries(translations)) {
        translated = translated.replace(new RegExp(english, 'gi'), bengali);
      }
      
      return translated;
    }

    ipcMain.handle("generate-tts-announcement", async (event, { text, shift }) => {
      try {
        const { spawn } = require('child_process');
        const path = require('path');
        const fs = require('fs');
        const os = require('os');
        
        const ttsScriptPath = path.join(process.cwd(), 'main.py');
        
        if (!fs.existsSync(ttsScriptPath)) {
          throw new Error('TTS script not found');
        }

        const timestamp = Date.now();
        const outputDir = path.join(os.tmpdir(), 'bus-announcements');
        
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
        
        const outputFile = path.join(outputDir, `announcement_${shift}_${timestamp}.wav`);
        
        console.log('Generating TTS for Bengali text:', text);
        
        return new Promise((resolve, reject) => {
          const pythonProcess = spawn('python', [ttsScriptPath, text], {
            stdio: ['pipe', 'pipe', 'pipe'],
            cwd: process.cwd()
          });

          let output = '';
          let errorOutput = '';

          pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
          });

          pythonProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
          });

          pythonProcess.on('close', (code) => {
            if (code === 0) {
              const lines = output.split('\n');
              let audioPath = null;
              
              for (const line of lines) {
                if (line.includes('.wav') || line.includes('.mp3')) {
                  const match = line.match(/([^\s]+\.(wav|mp3))/);
                  if (match) {
                    audioPath = match[1];
                    break;
                  }
                }
              }
              
              if (audioPath && fs.existsSync(audioPath)) {
                console.log('TTS generated successfully:', audioPath);
                resolve({
                  success: true,
                  audioPath: audioPath,
                  message: 'Bengali TTS generated successfully'
                });
              } else {
                reject(new Error('Audio file not found in TTS output'));
              }
            } else {
              reject(new Error(`TTS generation failed: ${errorOutput}`));
            }
          });

          pythonProcess.on('error', (err) => {
            reject(new Error(`Failed to start TTS process: ${err.message}`));
          });
        });
        
      } catch (error) {
        console.error('TTS announcement error:', error);
        return {
          success: false,
          error: error.message
        };
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
    autoHideMenuBar: true, 
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
