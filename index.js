const express = require("express");
const cors = require('cors')
const si = require("systeminformation");
const port = 3000;

const app = express();
app.use(cors())

app.get("/", async (req, res) => {
  try {
    const system = await si.system();
    const cpu = await si.cpu();
    const memory = await si.mem();
    const battery = await si.battery();
    const osInfo = await si.osInfo();
    const disks = await si.diskLayout();
    const network = await si.networkInterfaces();
    const chassis = await si.chassis();
    const baseboard = await si.baseboard();
    const bios = await si.bios();
    const graphics = await si.graphics();
    const time = await si.time();

    const ipv4 = network.find((nic) => nic.ip4)?.ip4 || "N/A";
    const ipv6 = network.find((nic) => nic.ip6)?.ip6 || "N/A";
    res.json({
      "Chassis Type": chassis.type,
      "Current Timezone": time.timezone,
      "Timezone Location": time.timezoneName, 
      "CPU 🖥️": {
        Manufacturer: cpu.manufacturer,
        Brand: cpu.brand,
        "Speed (GHz)": cpu.speed.toFixed(2),
        Cores: cpu.cores,
        "Physical Cores": cpu.physicalCores,
        "Performance Cores": cpu.performanceCores || "N/A",
        "Efficiency Cores": cpu.efficiencyCores || "N/A",
        Virtualization: cpu.virtualization ? "Supported" : "Not Supported",
        "CPU Temperature (°C)": cpu.cpuTemperature,
      },

      "Baseboard (Motherboard) 🖧": {
        Manufacturer: baseboard.manufacturer,
        Model: baseboard.model,
        Version: baseboard.version,
      },

      "BIOS 🔧": {
        Vendor: bios.vendor,
        Version: bios.version,
        "Release Date": bios.releaseDate,
      },

      "Memory 💾": {
        "Total Memory (GB)": (memory.total / 1024 / 1024 / 1024).toFixed(2),
        "Free Memory (GB)": (memory.free / 1024 / 1024 / 1024).toFixed(2),
        "Used Memory (GB)": (memory.used / 1024 / 1024 / 1024).toFixed(2),
      },

      "Battery 🔋": {
        "Charging Status": battery.isCharging ? "Charging" : "Not Charging",
        "Battery Percentage": battery.percent + "%",
        "Cycle Count": battery.cycleCount,
        "Battery Manufacturer": battery.manufacturer,
        "Battery Model": battery.model,
        "Time Remaining": battery.timeRemaining
          ? battery.timeRemaining + " minutes"
          : "N/A",
      },

      "Operating System 🖥️": {
        Platform: osInfo.platform,
        Distribution: osInfo.distro,
        "Release Version": osInfo.release,
        Codename: osInfo.codename,
      },

      "Disk Drives 💽": disks.map((disk) => ({
        Device: disk.device,
        Type: disk.type,
        "Size (GB)": (disk.size / 1024 / 1024 / 1024).toFixed(2),
        "Mount Point": disk.mount,
      })),

      "User IP Address 🌍": {
        IPv4: ipv4,
        IPv6: ipv6,
      },

      "Graphics Controllers 🎮": graphics.controllers.map((controller) => ({
        Vendor: controller.vendor,
        "Sub-Vendor": controller.subVendor,
        Model: controller.model,
        Bus: controller.bus,
        "VRAM (MB)": controller.vram,
        "VRAM Dynamic": controller.vramDynamic ? "Yes" : "No",
        "Device ID": controller.deviceId || "N/A",
        "Driver Version": controller.driverVersion || "N/A",
        "Temperature GPU (°C)": controller.temperatureGpu || "N/A",
      })),

      "Displays 🖥️": graphics.displays.map((display) => ({
        Vendor: display.vendor || "N/A",
        Model: display.model,
        "Main Monitor": display.main ? "Yes" : "No",
        Connection: display.connection,
        Resolution: `${display.resolutionX}x${display.resolutionY}`,
        "Current Resolution": `${display.currentResX}x${display.currentResY}`,
        "Refresh Rate": display.currentRefreshRate || "N/A",
        Position: `${display.positionX}, ${display.positionY}`,
      })),
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch system information",
      details: error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
