import React from "react";
import * as Select from "@radix-ui/react-select";
import { useTranslation } from "react-i18next";
import { usePomodoroStore } from "../stores/pomodoroStore";
import { useSettingsStore } from "../stores/settingsStore";
import { kanbanApi } from "../api";
import { themes } from "../../shared/themes";
import {
  Sliders,
  Clock,
  Layout,
  Database,
  Download,
  Upload,
  AlertTriangle,
  Info,
  Box,
  ChevronDown,
  ChevronUp,
  Check,
} from "lucide-react";

interface RadixSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  ariaLabel?: string;
  placeholder?: string;
}

function RadixSelect({
  value,
  onValueChange,
  options,
  ariaLabel,
  placeholder,
}: RadixSelectProps) {
  return (
    <Select.Root value={value} onValueChange={onValueChange}>
      <Select.Trigger className="radix-select-trigger" aria-label={ariaLabel}>
        <Select.Value placeholder={placeholder} />
        <Select.Icon asChild>
          <ChevronDown className="radix-select-chevron" size={14} />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          className="radix-select-content"
          position="popper"
          sideOffset={5}
        >
          <Select.ScrollUpButton className="radix-select-scroll-btn">
            <ChevronUp size={14} />
          </Select.ScrollUpButton>
          <Select.Viewport className="radix-select-viewport">
            {options.map((opt) => (
              <Select.Item
                key={opt.value}
                value={opt.value}
                className="radix-select-item"
              >
                <Select.ItemIndicator className="radix-select-indicator">
                  <Check size={14} />
                </Select.ItemIndicator>
                <Select.ItemText>{opt.label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
          <Select.ScrollDownButton className="radix-select-scroll-btn">
            <ChevronDown size={14} />
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

export function Settings() {
  const { t, i18n } = useTranslation();
  const {
    setFocusTime,
    setBreakTime,
    setLongBreakTime,
    setTotalRounds,
    setNotificationsEnabled,
  } = usePomodoroStore();

  const { settings, updateSetting } = useSettingsStore();

  const [exportStatus, setExportStatus] = React.useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const handleExportData = async () => {
    if (exportStatus === "loading") return;
    setExportStatus("loading");
    try {
      const payload = await kanbanApi.exportData();
      const content = JSON.stringify(payload, null, 2);
      const timestamp = new Date().toISOString().slice(0, 10);
      const result = await kanbanApi.showSaveDialog(
        `kanban-export-${timestamp}.json`,
        content,
      );
      if (result?.success) {
        setExportStatus("success");
      } else {
        setExportStatus("idle"); // Cancelled — no error
      }
    } catch (err) {
      console.error("Export failed:", err);
      setExportStatus("error");
    } finally {
      // Reset success/error state after 3 seconds
      setTimeout(() => setExportStatus("idle"), 3000);
    }
  };

  const handleFocusTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 1;
    setFocusTime(val);
    updateSetting("focusTime", val.toString());
  };

  const handleBreakTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 1;
    setBreakTime(val);
    updateSetting("shortBreakTime", val.toString());
  };

  const handleLongBreakTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 1;
    setLongBreakTime(val);
    updateSetting("longBreakTime", val.toString());
  };

  const handleTotalRoundsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 1;
    setTotalRounds(val);
    updateSetting("totalRounds", val.toString());
  };

  const handleNotificationsChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const checked = e.target.checked;
    setNotificationsEnabled(checked);
    updateSetting("notificationsEnabled", checked.toString());
  };

  return (
    <main className="settings-page">
      <div className="settings-scroll-area">
        <div className="settings-content-wrapper">
          {/* Header */}
          <div className="settings-page-header">
            <h2>{t("settings.title")}</h2>
            <p>{t("settings.description")}</p>
          </div>

          {/* Section - General Settings */}
          <div className="settings-section">
            <div className="settings-section-header">
              <Sliders size={20} color="var(--accent-color)" strokeWidth={2} />
              <h3>{t("settings.general.title")}</h3>
            </div>
            <div className="settings-card">
              <div className="settings-card-row">
                <div className="settings-card-info">
                  <h4>{t("settings.general.theme")}</h4>
                  <p>{t("settings.general.theme_desc")}</p>
                </div>
                <div className="settings-card-actions">
                  <RadixSelect
                    value={settings.theme || "system"}
                    onValueChange={(val) => updateSetting("theme", val)}
                    options={[
                      { value: "dark", label: t("settings.general.theme_dark") },
                      { value: "light", label: t("settings.general.theme_light") },
                      { value: "system", label: t("settings.general.theme_system") },
                    ]}
                    ariaLabel={t("settings.general.theme")}
                  />
                </div>
              </div>
              <div className="settings-divider"></div>
              <div className="settings-card-row">
                <div className="settings-card-info">
                  <h4>{t("settings.general.color_scheme")}</h4>
                  <p>{t("settings.general.color_scheme_desc")}</p>
                </div>
                <div className="settings-card-actions">
                  <RadixSelect
                    value={settings.colorScheme || "Base16 Default"}
                    onValueChange={(val) => updateSetting("colorScheme", val)}
                    options={themes.map((t) => ({
                      value: t.name,
                      label: t.name,
                    }))}
                    ariaLabel={t("settings.general.color_scheme")}
                  />
                </div>
              </div>
              <div className="settings-divider"></div>
              <div className="settings-card-row">
                <div className="settings-card-info">
                  <h4>{t("settings.general.language")}</h4>
                  <p>{t("settings.general.language_desc")}</p>
                </div>
                <div className="settings-card-actions">
                  <RadixSelect
                    value={i18n.language.split("-")[0]}
                    onValueChange={(val) => i18n.changeLanguage(val)}
                    options={[
                      { value: "en", label: "English" },
                      { value: "es", label: "Español" },
                      { value: "pt", label: "Português" },
                    ]}
                    ariaLabel={t("settings.general.language")}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section - Pomodoro Configuration */}
          <div className="settings-section">
            <div className="settings-section-header">
              <Clock size={20} color="var(--accent-color)" strokeWidth={2} />
              <h3>{t("settings.pomodoro.title")}</h3>
            </div>
            <div className="settings-card">
              <div className="settings-card-row">
                <div className="settings-card-info">
                  <h4>{t("settings.pomodoro.focus_duration")}</h4>
                  <p>{t("settings.pomodoro.focus_duration_desc")}</p>
                </div>
                <div className="settings-card-actions">
                  <input
                    type="number"
                    className="form-input"
                    style={{ width: "80px" }}
                    value={settings.focusTime || "25"}
                    onChange={handleFocusTimeChange}
                    min="1"
                    max="60"
                  />
                </div>
              </div>
              <div className="settings-divider"></div>
              <div className="settings-card-row">
                <div className="settings-card-info">
                  <h4>{t("settings.pomodoro.short_break_duration")}</h4>
                  <p>{t("settings.pomodoro.short_break_duration_desc")}</p>
                </div>
                <div className="settings-card-actions">
                  <input
                    type="number"
                    className="form-input"
                    style={{ width: "80px" }}
                    value={settings.shortBreakTime || "5"}
                    onChange={handleBreakTimeChange}
                    min="1"
                    max="30"
                  />
                </div>
              </div>
              <div className="settings-divider"></div>
              <div className="settings-card-row">
                <div className="settings-card-info">
                  <h4>{t("settings.pomodoro.long_break_duration")}</h4>
                  <p>{t("settings.pomodoro.long_break_duration_desc")}</p>
                </div>
                <div className="settings-card-actions">
                  <input
                    type="number"
                    className="form-input"
                    style={{ width: "80px" }}
                    value={settings.longBreakTime || "15"}
                    onChange={handleLongBreakTimeChange}
                    min="1"
                    max="60"
                  />
                </div>
              </div>
              <div className="settings-divider"></div>
              <div className="settings-card-row">
                <div className="settings-card-info">
                  <h4>{t("settings.pomodoro.target_rounds")}</h4>
                  <p>{t("settings.pomodoro.target_rounds_desc")}</p>
                </div>
                <div className="settings-card-actions">
                  <input
                    type="number"
                    className="form-input"
                    style={{ width: "80px" }}
                    value={settings.totalRounds || "4"}
                    onChange={handleTotalRoundsChange}
                    min="1"
                    max="12"
                  />
                </div>
              </div>
              <div className="settings-divider"></div>
              <div className="settings-card-row">
                <div className="settings-card-info">
                  <h4>{t("settings.pomodoro.notifications")}</h4>
                  <p>{t("settings.pomodoro.notifications_desc")}</p>
                </div>
                <div className="settings-card-actions">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.notificationsEnabled === "true"}
                      onChange={handleNotificationsChange}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Section - Board Management */}
          <div className="settings-section">
            <div className="settings-section-header">
              <Layout size={20} color="var(--accent-color)" strokeWidth={2} />
              <h3>{t("settings.board.title")}</h3>
            </div>
            <div className="settings-card">
              <div className="settings-card-block">
                <div className="settings-card-info">
                  <h4>{t("settings.board.default_view")}</h4>
                  <p>{t("settings.board.default_view_desc")}</p>
                </div>
                <div
                  className="settings-card-actions"
                  style={{ marginTop: "16px" }}
                >
                  <RadixSelect
                    value={settings.boardViewMode || "kanban"}
                    onValueChange={(val) =>
                      updateSetting("boardViewMode", val)
                    }
                    options={[
                      { value: "kanban", label: t("settings.board.kanban") },
                      { value: "table", label: t("settings.board.table") },
                    ]}
                    ariaLabel={t("settings.board.default_view")}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section - Data Management */}
          <div className="settings-section">
            <div className="settings-section-header">
              <Database size={20} color="var(--accent-color)" strokeWidth={2} />
              <h3>{t("settings.data.title")}</h3>
            </div>

            <div className="settings-card">
              <div className="settings-card-block">
                <div className="settings-card-info">
                  <h4>{t("settings.data.export")}</h4>
                  <p>{t("settings.data.export_desc")}</p>
                </div>
                <div
                  className="settings-actions-row"
                  style={{ marginTop: "16px" }}
                >
                  <button
                    className={`btn-secondary ${exportStatus === "success" ? "btn-success" : exportStatus === "error" ? "btn-error" : ""}`}
                    onClick={handleExportData}
                    disabled={exportStatus === "loading"}
                  >
                    <Download size={16} strokeWidth={2} />
                    {exportStatus === "loading"
                      ? t("settings.data.exporting")
                      : exportStatus === "success"
                        ? t("settings.data.exported")
                        : exportStatus === "error"
                          ? t("settings.data.export_failed")
                          : t("settings.data.export")}
                  </button>
                  <button className="btn-secondary" disabled>
                    <Upload size={16} strokeWidth={2} />
                    {t("settings.data.import")}
                  </button>
                </div>
              </div>

              <div className="settings-divider"></div>

              <div className="settings-card-block danger-block">
                <div className="danger-header">
                  <div className="danger-icon">
                    <AlertTriangle size={20} strokeWidth={2} />
                  </div>
                  <div className="danger-info">
                    <h4>{t("settings.data.danger_zone")}</h4>
                    <p>{t("settings.data.reset_desc")}</p>
                  </div>
                </div>
                <button className="btn-danger">{t("settings.data.reset_workspace")}</button>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="settings-section">
            <div className="settings-section-header">
              <Info size={20} color="var(--accent-color)" strokeWidth={2} />
              <h3>About</h3>
            </div>

            <div className="settings-card about-card">
              <div className="about-hero">
                <div className="about-logo-wrapper">
                  <Box size={32} strokeWidth={2} />
                </div>
                <h4>Kanban Desktop Pro</h4>
                <p>Version 1.2.0 (Build 2024.10.24)</p>
              </div>

              <div className="settings-divider"></div>

              <div className="about-credits">
                <div className="credits-text">
                  <span>Developed By</span>
                  <strong>Studio Blueprints</strong>
                  <a href="#">studio-blueprints.io</a>
                </div>
                <div className="credits-logo">
                  <div className="logo-placeholder">SB</div>
                </div>
              </div>
            </div>
          </div>

          <footer className="settings-footer">
            <p>© 2024 Kanban Desktop Pro. All rights reserved.</p>
            <div className="footer-links">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
            </div>
          </footer>
        </div>
      </div>
    </main>
  );
}
