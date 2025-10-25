"use client";

import { useState, useEffect } from "react";

import AnimatedCard from "@/app/components/ui/AnimatedCard";
import Badge from "@/app/components/ui/Badge";
import Icon from "@/app/components/ui/Icon";

interface FeatureFlag {
  id: string;
  flag_key: string;
  name: string;
  description: string | null;
  enabled: boolean;
  rollout_percentage: number;
  updated_at: string;
  updated_by: string | null;
}

interface SystemConfig {
  key: string;
  value: Record<string, unknown>;
  category: string;
  description: string | null;
  editable: boolean;
  updated_at: string;
  updated_by: string | null;
}

export default function ConfigurationManager() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [configs, setConfigs] = useState<SystemConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<"flags" | "config">("flags");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [flagsRes, configRes] = await Promise.all([
        fetch("/api/admin/feature-flags"),
        fetch("/api/admin/system-config"),
      ]);

      if (flagsRes.ok) {
        const flagsData = await flagsRes.json();
        setFlags(flagsData.flags);
      }

      if (configRes.ok) {
        const configData = await configRes.json();
        setConfigs(configData.configs);
      }
    } catch (error) {
      console.error("Error loading configuration:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFlag = async (flagKey: string, enabled: boolean) => {
    try {
      const res = await fetch("/api/admin/feature-flags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flag_key: flagKey, enabled }),
      });

      if (!res.ok) throw new Error("Failed to update flag");

      alert(`✅ Feature flag ${enabled ? "enabled" : "disabled"}`);
      await loadData();
    } catch (error) {
      alert("Failed to update feature flag");
    }
  };

  const updateConfig = async (key: string, value: Record<string, unknown>) => {
    try {
      const res = await fetch("/api/admin/system-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });

      if (!res.ok) throw new Error("Failed to update config");

      alert("✅ Configuration updated");
      await loadData();
    } catch (error) {
      alert("Failed to update configuration");
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="text-text-muted">Loading configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Toggle */}
      <div className="bg-surface-hover flex w-fit items-center gap-2 rounded-lg border border-border p-1">
        <button
          onClick={() => setActiveSection("flags")}
          className={`rounded px-4 py-2 text-sm font-semibold transition-colors ${
            activeSection === "flags"
              ? "bg-primary text-white"
              : "text-text-muted hover:text-text-body"
          }`}
        >
          🚩 Feature Flags ({flags.length})
        </button>
        <button
          onClick={() => setActiveSection("config")}
          className={`rounded px-4 py-2 text-sm font-semibold transition-colors ${
            activeSection === "config"
              ? "bg-primary text-white"
              : "text-text-muted hover:text-text-body"
          }`}
        >
          ⚙️ System Config ({configs.length})
        </button>
      </div>

      {/* Feature Flags Section */}
      {activeSection === "flags" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-text-headings text-xl font-bold">Feature Flags</h3>
              <p className="text-text-muted text-sm">
                Enable or disable features without deploying code
              </p>
            </div>
            <Badge variant="info">{flags.filter((f) => f.enabled).length} Enabled</Badge>
          </div>

          {flags.map((flag, index) => (
            <AnimatedCard key={flag.flag_key} delay={index * 30} className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <h4 className="text-text-headings text-lg font-bold">{flag.name}</h4>
                    <Badge variant={flag.enabled ? "success" : "secondary"} size="sm">
                      {flag.enabled ? "ENABLED" : "DISABLED"}
                    </Badge>
                  </div>
                  <p className="text-text-muted mb-2 text-sm">{flag.description}</p>
                  <div className="text-text-muted flex items-center gap-4 text-xs">
                    <span>
                      Key: <code className="bg-surface-hover rounded px-1">{flag.flag_key}</code>
                    </span>
                    {flag.updated_by && (
                      <span>Last updated: {new Date(flag.updated_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => toggleFlag(flag.flag_key, !flag.enabled)}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${flag.enabled ? "bg-success" : "bg-gray-300"} `}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${flag.enabled ? "translate-x-7" : "translate-x-1"} `}
                  />
                </button>
              </div>
            </AnimatedCard>
          ))}
        </div>
      )}

      {/* System Config Section */}
      {activeSection === "config" && (
        <div className="space-y-4">
          <div>
            <h3 className="text-text-headings text-xl font-bold">System Configuration</h3>
            <p className="text-text-muted text-sm">Manage system-wide settings and constants</p>
          </div>

          {/* Group by category */}
          {["system", "features", "email"].map((category) => {
            const categoryConfigs = configs.filter((c) => c.category === category);
            if (categoryConfigs.length === 0) return null;

            return (
              <div key={category}>
                <h4 className="text-text-headings mb-3 text-lg font-bold capitalize">
                  {category} Settings
                </h4>
                <div className="space-y-3">
                  {categoryConfigs.map((config, index) => (
                    <AnimatedCard key={config.key} delay={index * 30} className="p-6">
                      <div className="mb-4 flex items-start justify-between gap-4">
                        <div>
                          <h5 className="text-text-headings mb-1 font-bold">{config.key}</h5>
                          <p className="text-text-muted text-sm">{config.description}</p>
                        </div>
                        {config.editable ? (
                          <Badge variant="info" size="sm">
                            EDITABLE
                          </Badge>
                        ) : (
                          <Badge variant="secondary" size="sm">
                            READ-ONLY
                          </Badge>
                        )}
                      </div>

                      <div className="bg-surface-hover rounded-lg border border-border p-4">
                        <pre className="text-text-body overflow-x-auto font-mono text-xs">
                          {JSON.stringify(config.value, null, 2)}
                        </pre>
                      </div>

                      {config.editable && (
                        <div className="mt-3 flex justify-end gap-2">
                          <button
                            onClick={() => {
                              const newValue = prompt(
                                "Enter new JSON value:",
                                JSON.stringify(config.value, null, 2)
                              );
                              if (newValue) {
                                try {
                                  const parsed = JSON.parse(newValue);
                                  updateConfig(config.key, parsed);
                                } catch {
                                  alert("Invalid JSON");
                                }
                              }
                            }}
                            className="hover:bg-primary-hover rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-white transition-colors"
                          >
                            <Icon name="Edit" className="mr-1 inline h-3 w-3" />
                            Edit
                          </button>
                        </div>
                      )}

                      {config.updated_by && (
                        <p className="text-text-muted mt-2 text-xs">
                          Last updated: {new Date(config.updated_at).toLocaleString()} by{" "}
                          {config.updated_by.substring(0, 12)}...
                        </p>
                      )}
                    </AnimatedCard>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
