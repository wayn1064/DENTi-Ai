import { Router } from "express";
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get initial vendors list
router.get("/vendors", async (req, res) => {
  try {
    const { hospitalId } = req.query;
    if (!hospitalId) {
      return res.status(400).json({ error: "hospitalId is required" });
    }
    const vendors = await prisma.vendor.findMany({
      where: { hospitalId: String(hospitalId) }
    });
    res.json(vendors);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch vendors" });
  }
});

// Get inventory
router.get("/inventory", async (req, res) => {
  try {
    const { hospitalId } = req.query;
    if (!hospitalId) {
      return res.status(400).json({ error: "hospitalId is required" });
    }
    const inventory = await prisma.inventory.findMany({
      where: { hospitalId: String(hospitalId) }
    });
    res.json(inventory);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch inventory" });
  }
});

// Get orders
router.get("/orders", async (req, res) => {
  try {
    const { hospitalId } = req.query;
    if (!hospitalId) {
      return res.status(400).json({ error: "hospitalId is required" });
    }
    const orders = await prisma.order.findMany({
      where: { hospitalId: String(hospitalId) }
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Get sterilization logs
router.get("/sterilization", async (req, res) => {
  try {
    const { hospitalId } = req.query;
    if (!hospitalId) {
      return res.status(400).json({ error: "hospitalId is required" });
    }
    const logs = await prisma.sterilizationLog.findMany({
      where: { hospitalId: String(hospitalId) }
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch sterilization logs" });
  }
});

// Get cleaning logs
router.get("/cleaning", async (req, res) => {
  try {
    const { hospitalId } = req.query;
    if (!hospitalId) {
      return res.status(400).json({ error: "hospitalId is required" });
    }
    const logs = await prisma.cleaningLog.findMany({
      where: { hospitalId: String(hospitalId) }
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch cleaning logs" });
  }
});

// Get AS requests
router.get("/as", async (req, res) => {
  try {
    const { hospitalId } = req.query;
    if (!hospitalId) {
      return res.status(400).json({ error: "hospitalId is required" });
    }
    const asLogs = await prisma.asRequest.findMany({
      where: { hospitalId: String(hospitalId) }
    });
    res.json(asLogs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch as requests" });
  }
});

export default router;
