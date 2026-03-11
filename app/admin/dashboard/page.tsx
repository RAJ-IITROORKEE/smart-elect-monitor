"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MoreHorizontal,
  Plus,
  Wifi,
  WifiOff,
  Trash2,
  Pencil,
  Server,
  Activity,
  RefreshCw,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Device {
  id: string;
  deviceId: string;
  deviceName: string;
  isActive: boolean;
  lastSeen: string;
  totalReadings: number;
  lastPh: number | null;
  lastTds: number | null;
  lastTemperature: number | null;
  lastTurbidity: number | null;
  lastConductivity: number | null;
  rssi: number | null;
  snr: number | null;
  createdAt: string;
  updatedAt: string;
}

const STALE_MS = 2 * 60 * 1000;

function isLive(lastSeen: string) {
  return Date.now() - new Date(lastSeen).getTime() < STALE_MS;
}

export default function AdminDashboardPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add dialog
  const [addOpen, setAddOpen] = useState(false);
  const [addDeviceId, setAddDeviceId] = useState("");
  const [addDeviceName, setAddDeviceName] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editDevice, setEditDevice] = useState<Device | null>(null);
  const [editDeviceName, setEditDeviceName] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete dialog
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteDevice, setDeleteDevice] = useState<Device | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchDevices = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/devices");
      const json = await res.json();
      if (json.status === "ok") {
        setDevices(json.data);
        setError(null);
      } else {
        setError(json.message ?? "Failed to load devices");
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDevices();
    const interval = setInterval(fetchDevices, 30_000);
    return () => clearInterval(interval);
  }, [fetchDevices]);

  // ── Add Device ──────────────────────────────────────────────────────────
  async function handleAdd() {
    if (!addDeviceId.trim()) {
      setAddError("Device ID is required");
      return;
    }
    setAddLoading(true);
    setAddError(null);
    try {
      const res = await fetch("/api/admin/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId: addDeviceId.trim(),
          deviceName: addDeviceName.trim() || addDeviceId.trim(),
        }),
      });
      const json = await res.json();
      if (json.status === "ok") {
        setAddOpen(false);
        setAddDeviceId("");
        setAddDeviceName("");
        await fetchDevices();
      } else {
        setAddError(json.message ?? "Failed to add device");
      }
    } catch (e) {
      setAddError(String(e));
    } finally {
      setAddLoading(false);
    }
  }

  // ── Edit Device ─────────────────────────────────────────────────────────
  function openEdit(device: Device) {
    setEditDevice(device);
    setEditDeviceName(device.deviceName);
    setEditError(null);
    setEditOpen(true);
  }

  async function handleEdit() {
    if (!editDevice) return;
    setEditLoading(true);
    setEditError(null);
    try {
      const res = await fetch(`/api/admin/devices/${editDevice.deviceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceName: editDeviceName }),
      });
      const json = await res.json();
      if (json.status === "ok") {
        setEditOpen(false);
        await fetchDevices();
      } else {
        setEditError(json.message ?? "Failed to update device");
      }
    } catch (e) {
      setEditError(String(e));
    } finally {
      setEditLoading(false);
    }
  }

  // ── Delete Device ───────────────────────────────────────────────────────
  function openDelete(device: Device) {
    setDeleteDevice(device);
    setDeleteOpen(true);
  }

  async function handleDelete() {
    if (!deleteDevice) return;
    setDeleteLoading(true);
    try {
      await fetch(`/api/admin/devices/${deleteDevice.deviceId}`, { method: "DELETE" });
      setDeleteOpen(false);
      await fetchDevices();
    } catch (e) {
      console.error(e);
    } finally {
      setDeleteLoading(false);
    }
  }

  const liveCount = devices.filter((d) => isLive(d.lastSeen)).length;
  const totalReadings = devices.reduce((s, d) => s + d.totalReadings, 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
            <Server className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{devices.length}</p>
            <p className="text-xs text-muted-foreground">Registered devices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Live Devices</CardTitle>
            <Wifi className="size-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{liveCount}</p>
            <p className="text-xs text-muted-foreground">Data in last 2 min</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Readings</CardTitle>
            <Activity className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalReadings.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Across all devices</p>
          </CardContent>
        </Card>
      </div>

      {/* Devices Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Devices</CardTitle>
              <CardDescription>
                Manage TTN devices. The Device ID must match the TTN end device ID.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={fetchDevices} title="Refresh">
                <RefreshCw className="size-4" />
              </Button>
              <Button onClick={() => { setAddDeviceId(""); setAddDeviceName(""); setAddError(null); setAddOpen(true); }}>
                <Plus className="size-4 mr-2" />
                Add Device
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Loading devices…</p>
          ) : error ? (
            <p className="text-sm text-destructive py-4 text-center">{error}</p>
          ) : devices.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No devices yet. Add your first device using the button above.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device ID (TTN)</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Seen</TableHead>
                  <TableHead>Readings</TableHead>
                  <TableHead>pH / TDS</TableHead>
                  <TableHead>Signal</TableHead>
                  <TableHead className="w-8"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {devices.map((device) => {
                  const live = isLive(device.lastSeen);
                  return (
                    <TableRow key={device.id}>
                      <TableCell className="font-mono text-xs">{device.deviceId}</TableCell>
                      <TableCell className="font-medium">{device.deviceName}</TableCell>
                      <TableCell>
                        {live ? (
                          <Badge className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                            <span className="mr-1.5 inline-block size-1.5 rounded-full bg-green-500 animate-pulse" />
                            Live
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-amber-600 border-amber-300 dark:border-amber-700">
                            <WifiOff className="size-3 mr-1" />
                            Offline
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(device.lastSeen), { addSuffix: true })}
                      </TableCell>
                      <TableCell>{(device.totalReadings ?? 0).toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {device.lastPh != null ? `${device.lastPh.toFixed(1)} / ${device.lastTds?.toFixed(0) ?? "—"}` : "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {device.rssi != null ? `${device.rssi} dBm` : "—"}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(device)}>
                              <Pencil className="size-4 mr-2" />
                              Edit Name
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openDelete(device)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="size-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ── Add Device Dialog ──────────────────────────────────────────────── */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Device</DialogTitle>
            <DialogDescription>
              Enter the TTN Device ID exactly as it appears in The Things Network console.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="add-device-id">Device ID (TTN) *</Label>
              <Input
                id="add-device-id"
                placeholder="e.g. hydro-monitor-01"
                value={addDeviceId}
                onChange={(e) => setAddDeviceId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-device-name">Display Name</Label>
              <Input
                id="add-device-name"
                placeholder="e.g. River Station Alpha (optional)"
                value={addDeviceName}
                onChange={(e) => setAddDeviceName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
            </div>
            {addError && <p className="text-sm text-destructive">{addError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={addLoading}>
              {addLoading ? "Adding…" : "Add Device"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Device Dialog ─────────────────────────────────────────────── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Device</DialogTitle>
            <DialogDescription>
              Update the display name for{" "}
              <code className="text-xs">{editDevice?.deviceId}</code>.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="edit-device-name">Display Name</Label>
              <Input
                id="edit-device-name"
                value={editDeviceName}
                onChange={(e) => setEditDeviceName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleEdit()}
              />
            </div>
            {editError && <p className="text-sm text-destructive">{editError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit} disabled={editLoading}>
              {editLoading ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm Dialog ──────────────────────────────────────────── */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Device</DialogTitle>
            <DialogDescription>
              This will permanently delete{" "}
              <strong>{deleteDevice?.deviceName}</strong> and all{" "}
              <strong>{(deleteDevice?.totalReadings ?? 0).toLocaleString()}</strong> readings.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteLoading}>
              {deleteLoading ? "Deleting…" : "Delete Device"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
