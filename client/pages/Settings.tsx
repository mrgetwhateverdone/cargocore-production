import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { useSettings } from "@/contexts/SettingsContext";
import { 
  Settings as SettingsIcon, 
  Brain, 
  Cpu, 
  Database, 
  Layout as LayoutIcon,
  Monitor,
  Sliders,
  Trash2,
  Clock,
  Globe,
  DollarSign,
  FileText,
  Package,
  Building2
} from "lucide-react";

/**
 * This part of the code creates the comprehensive Settings page
 * Provides user control over all CargoCore configuration options - Phase 1 & 2
 */
export default function Settings() {
  const {
    settings,
    updateAgentSetting,
    updateAISetting,
    updateCacheSetting,
    updatePageSetting,
    updateDisplaySetting,
    updateOperationalSetting,
    updateUISetting,
    updateQuickAction,
    clearCache,
    resetToDefaults
  } = useSettings();

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  /**
   * This part of the code handles cache clearing with user confirmation
   * Provides feedback on cache status and clearing results
   */
  const handleClearCache = () => {
    clearCache();
    console.log('AI cache cleared successfully');
  };

  /**
   * This part of the code handles resetting all settings to defaults
   * Includes confirmation step to prevent accidental resets
   */
  const handleResetToDefaults = () => {
    if (showResetConfirm) {
      resetToDefaults();
      setShowResetConfirm(false);
      console.log('Settings reset to defaults');
    } else {
      setShowResetConfirm(true);
      setTimeout(() => setShowResetConfirm(false), 5000);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6 bg-gray-50 min-h-screen p-6">
        {/* This part of the code creates the main settings header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <SettingsIcon className="h-6 w-6 text-blue-600" />
              Settings
            </h1>
            <p className="text-gray-600 text-sm">
              Configure your CargoCore experience and AI assistant behavior
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleResetToDefaults}
              className={showResetConfirm ? "border-red-500 text-red-600" : ""}
            >
              {showResetConfirm ? "Click again to confirm" : "Reset to Defaults"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* PHASE 1: Agent Configuration */}
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" />
                Agent Configuration
              </CardTitle>
              <p className="text-sm text-gray-600">
                Control AI agent behavior and threshold settings
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Dashboard Agent */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <LayoutIcon className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Dashboard Agent</p>
                    <p className="text-sm text-gray-500">Cross-domain critical issues detection</p>
                  </div>
                </div>
                <Switch
                  checked={settings.agents.dashboard.enabled}
                  onCheckedChange={(checked) => updateAgentSetting('dashboard', 'enabled', checked)}
                />
              </div>
              
              {settings.agents.dashboard.enabled && (
                <div className="ml-10">
                  <label className="text-sm font-medium text-gray-700">Notification Threshold</label>
                  <Select
                    value={settings.agents.dashboard.notificationThreshold}
                    onValueChange={(value) => updateAgentSetting('dashboard', 'notificationThreshold', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High severity only</SelectItem>
                      <SelectItem value="medium_high">Medium and high severity</SelectItem>
                      <SelectItem value="all">All insights</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Separator />

              {/* Orders Agent */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Package className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Orders Agent</p>
                    <p className="text-sm text-gray-500">Delay and cancellation detection</p>
                  </div>
                </div>
                <Switch
                  checked={settings.agents.orders.enabled}
                  onCheckedChange={(checked) => updateAgentSetting('orders', 'enabled', checked)}
                />
              </div>
              
              {settings.agents.orders.enabled && (
                <div className="ml-10">
                  <label className="text-sm font-medium text-gray-700">SLA Risk Threshold</label>
                  <Select
                    value={settings.agents.orders.slaRiskThreshold}
                    onValueChange={(value) => updateAgentSetting('orders', 'slaRiskThreshold', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6_hours">6 hours before deadline</SelectItem>
                      <SelectItem value="12_hours">12 hours before deadline</SelectItem>
                      <SelectItem value="24_hours">24 hours before deadline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Separator />

              {/* Analytics Agent */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Sliders className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium">Analytics Agent</p>
                    <p className="text-sm text-gray-500">Trend analysis and anomaly detection</p>
                  </div>
                </div>
                <Switch
                  checked={settings.agents.analytics.enabled}
                  onCheckedChange={(checked) => updateAgentSetting('analytics', 'enabled', checked)}
                />
              </div>
              
              {settings.agents.analytics.enabled && (
                <div className="ml-10">
                  <label className="text-sm font-medium text-gray-700">Anomaly Sensitivity</label>
                  <Select
                    value={settings.agents.analytics.anomalySensitivity}
                    onValueChange={(value) => updateAgentSetting('analytics', 'anomalySensitivity', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High (detect subtle changes)</SelectItem>
                      <SelectItem value="medium">Medium (balanced detection)</SelectItem>
                      <SelectItem value="low">Low (major changes only)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Separator />

              {/* Inventory Agent */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Database className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium">Inventory Agent</p>
                    <p className="text-sm text-gray-500">Stock optimization and reorder suggestions</p>
                  </div>
                </div>
                <Switch
                  checked={settings.agents.inventory.enabled}
                  onCheckedChange={(checked) => updateAgentSetting('inventory', 'enabled', checked)}
                />
              </div>
              
              {settings.agents.inventory.enabled && (
                <div className="ml-10">
                  <label className="text-sm font-medium text-gray-700">Reorder Point Strategy</label>
                  <Select
                    value={settings.agents.inventory.reorderStrategy}
                    onValueChange={(value) => updateAgentSetting('inventory', 'reorderStrategy', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conservative">Conservative (higher safety stock)</SelectItem>
                      <SelectItem value="balanced">Balanced (standard levels)</SelectItem>
                      <SelectItem value="aggressive">Aggressive (minimal stock)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* PHASE 1: AI Configuration */}
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="h-5 w-5 text-purple-600" />
                AI Configuration
              </CardTitle>
              <p className="text-sm text-gray-600">
                Optimize AI performance and control token usage
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Refresh Strategy */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">Refresh Strategy</label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="on_load"
                      checked={settings.ai.refreshStrategy === 'on_load'}
                      onChange={() => updateAISetting('refreshStrategy', 'on_load')}
                      className="h-4 w-4 text-blue-600"
                    />
                    <label htmlFor="on_load" className="text-sm">
                      <span className="font-medium">Only on full app load</span>
                      <p className="text-gray-500">Most efficient - AI runs once per session</p>
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="every_page"
                      checked={settings.ai.refreshStrategy === 'every_page'}
                      onChange={() => updateAISetting('refreshStrategy', 'every_page')}
                      className="h-4 w-4 text-blue-600"
                    />
                    <label htmlFor="every_page" className="text-sm">
                      <span className="font-medium">Every page visit</span>
                      <p className="text-gray-500">Moderate usage - AI runs when you visit pages</p>
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="manual"
                      checked={settings.ai.refreshStrategy === 'manual'}
                      onChange={() => updateAISetting('refreshStrategy', 'manual')}
                      className="h-4 w-4 text-blue-600"
                    />
                    <label htmlFor="manual" className="text-sm">
                      <span className="font-medium">Manual refresh only</span>
                      <p className="text-gray-500">Maximum control - AI runs only when you request it</p>
                    </label>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Cost Controls */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                  💰 Cost Controls
                </h3>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">AI Model</label>
                  <Select
                    value={settings.ai.model}
                    onValueChange={(value) => updateAISetting('model', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (Cheaper, faster)</SelectItem>
                      <SelectItem value="gpt-4">GPT-4 (More capable, slower)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Max Tokens per Request: {settings.ai.maxTokens}
                  </label>
                  <Slider
                    value={[settings.ai.maxTokens]}
                    onValueChange={([value]) => updateAISetting('maxTokens', value)}
                    min={50}
                    max={500}
                    step={25}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>50 (minimal)</span>
                    <span>500 (detailed)</span>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-700">
                    <strong>Estimated Cost:</strong> Per request: ~$0.0003
                  </p>
                </div>
              </div>

              <Separator />

              {/* Response Settings */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Response Length</label>
                  <Select
                    value={settings.ai.responseLength}
                    onValueChange={(value) => updateAISetting('responseLength', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="brief">Brief (quick insights)</SelectItem>
                      <SelectItem value="detailed">Detailed (comprehensive analysis)</SelectItem>
                      <SelectItem value="adaptive">Adaptive (context-dependent)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Context Level</label>
                  <Select
                    value={settings.ai.contextLevel}
                    onValueChange={(value) => updateAISetting('contextLevel', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full (all operational data)</SelectItem>
                      <SelectItem value="limited">Limited (key metrics only)</SelectItem>
                      <SelectItem value="basic">Basic (minimal context)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* PHASE 2: Dashboard & Display Settings */}
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5 text-green-600" />
                Dashboard & Display Settings
              </CardTitle>
              <p className="text-sm text-gray-600">
                Control default page, refresh behavior, and display formats
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Default Landing Page */}
              <div>
                <label className="text-sm font-medium text-gray-700">Default Landing Page</label>
                <Select
                  value={settings.display.defaultPage}
                  onValueChange={(value) => updateDisplaySetting('defaultPage', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dashboard">Dashboard (Overview)</SelectItem>
                    <SelectItem value="orders">Orders (Order Management)</SelectItem>
                    <SelectItem value="inventory">Inventory (Stock Levels)</SelectItem>
                    <SelectItem value="analytics">Analytics (Business Intelligence)</SelectItem>
                    <SelectItem value="warehouses">Warehouses (Facility Management)</SelectItem>
                    <SelectItem value="cost_management">Cost Management</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">Page that loads when you first open CargoCore</p>
              </div>

              <Separator />

              {/* Auto-Refresh Settings */}
              <div>
                <label className="text-sm font-medium text-gray-700">Auto-Refresh Interval</label>
                <Select
                  value={settings.display.refreshInterval}
                  onValueChange={(value) => updateDisplaySetting('refreshInterval', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30s">Every 30 seconds</SelectItem>
                    <SelectItem value="1min">Every 1 minute</SelectItem>
                    <SelectItem value="5min">Every 5 minutes</SelectItem>
                    <SelectItem value="manual">Manual refresh only</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">How often data refreshes automatically</p>
              </div>

              <Separator />

              {/* Time Zone */}
              <div>
                <label className="text-sm font-medium text-gray-700">Time Zone</label>
                <Select
                  value={settings.display.timeZone}
                  onValueChange={(value) => updateDisplaySetting('timeZone', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">Eastern (EST/EDT)</SelectItem>
                    <SelectItem value="America/Chicago">Central (CST/CDT)</SelectItem>
                    <SelectItem value="America/Denver">Mountain (MST/MDT)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific (PST/PDT)</SelectItem>
                    <SelectItem value="UTC">UTC (Coordinated Universal Time)</SelectItem>
                    <SelectItem value="Europe/London">London (GMT/BST)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">Display timestamps in your local timezone</p>
              </div>

              <Separator />

              {/* Currency Format */}
              <div>
                <label className="text-sm font-medium text-gray-700">Currency Format</label>
                <Select
                  value={settings.display.currencyFormat}
                  onValueChange={(value) => updateDisplaySetting('currencyFormat', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usd_symbol">$1,234.56 (USD with symbol)</SelectItem>
                    <SelectItem value="usd_no_symbol">1,234.56 (USD without symbol)</SelectItem>
                    <SelectItem value="eur">€1,234.56 (EUR)</SelectItem>
                    <SelectItem value="gbp">£1,234.56 (GBP)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Number Precision */}
              <div>
                <label className="text-sm font-medium text-gray-700">Number Decimal Places</label>
                <Select
                  value={settings.display.numberFormat.toString()}
                  onValueChange={(value) => updateDisplaySetting('numberFormat', value === 'auto' ? 'auto' : parseInt(value))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">No decimals (1,234)</SelectItem>
                    <SelectItem value="2">Two decimals (1,234.56)</SelectItem>
                    <SelectItem value="auto">Auto-format based on value</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* PHASE 2: Operational Preferences */}
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-orange-600" />
                Operational Preferences
              </CardTitle>
              <p className="text-sm text-gray-600">
                Set default filters, formats, and operational behaviors
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Date Format */}
              <div>
                <label className="text-sm font-medium text-gray-700">Date Format</label>
                <Select
                  value={settings.operational.dateFormat}
                  onValueChange={(value) => updateOperationalSetting('dateFormat', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mm_dd_yyyy">MM/DD/YYYY (US Format)</SelectItem>
                    <SelectItem value="dd_mm_yyyy">DD/MM/YYYY (International)</SelectItem>
                    <SelectItem value="iso">YYYY-MM-DD (ISO Standard)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">How dates appear throughout the app</p>
              </div>

              <Separator />

              {/* Table Page Size */}
              <div>
                <label className="text-sm font-medium text-gray-700">Default Table Page Size</label>
                <Select
                  value={settings.operational.tablePageSize.toString()}
                  onValueChange={(value) => updateOperationalSetting('tablePageSize', parseInt(value))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 rows per page</SelectItem>
                    <SelectItem value="25">25 rows per page</SelectItem>
                    <SelectItem value="50">50 rows per page</SelectItem>
                    <SelectItem value="100">100 rows per page</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">Number of items to show in data tables</p>
              </div>

              <Separator />

              {/* Default Warehouses */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">Default Warehouse Filters</label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-2">
                    <strong>Currently:</strong> {settings.operational.defaultWarehouses.length === 0 
                      ? "All warehouses selected" 
                      : `${settings.operational.defaultWarehouses.length} warehouses selected`}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => updateOperationalSetting('defaultWarehouses', [])}
                  >
                    Reset to All Warehouses
                  </Button>
                </div>
                <p className="text-xs text-gray-500">Warehouse filters that are applied by default when loading pages</p>
              </div>

              <Separator />

              {/* Default Brands */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">Default Brand Filters</label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-2">
                    <strong>Currently:</strong> {settings.operational.defaultBrands.length === 0 
                      ? "All brands selected" 
                      : `${settings.operational.defaultBrands.length} brands selected`}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => updateOperationalSetting('defaultBrands', [])}
                  >
                    Reset to All Brands
                  </Button>
                </div>
                <p className="text-xs text-gray-500">Brand filters that are applied by default when loading pages</p>
              </div>
            </CardContent>
          </Card>

          {/* PHASE 1: Page-Specific Controls */}
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-600" />
                Page-Specific AI Controls
              </CardTitle>
              <p className="text-sm text-gray-600">
                Enable or disable AI insights for individual pages
              </p>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              {Object.entries(settings.pages).map(([page, enabled]) => (
                <div key={page} className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">
                    {page.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <Switch
                    checked={enabled}
                    onCheckedChange={(checked) => updatePageSetting(page as keyof typeof settings.pages, checked)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* PHASE 1: Cache Management */}
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-red-600" />
                Cache Management
              </CardTitle>
              <p className="text-sm text-gray-600">
                Store AI results to avoid repeated calls and reduce costs
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <div className="flex items-center justify-between">
                <span className="font-medium">Cache Enabled</span>
                <Switch
                  checked={settings.cache.enabled}
                  onCheckedChange={(checked) => updateCacheSetting('enabled', checked)}
                />
              </div>

              {settings.cache.enabled && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Cache Duration</label>
                  <Select
                    value={settings.cache.duration}
                    onValueChange={(value) => updateCacheSetting('duration', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1_hour">1 Hour</SelectItem>
                      <SelectItem value="1_day">1 Day</SelectItem>
                      <SelectItem value="1_week">1 Week</SelectItem>
                      <SelectItem value="manual">Until manually cleared</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Cache contains: <strong>{settings.cache.currentQueries} queries</strong>
                </p>
                <p className="text-sm text-gray-600">
                  Storage: <strong>{settings.cache.storageUsed} used</strong>
                </p>
              </div>

              <Button
                variant="destructive"
                onClick={handleClearCache}
                className="w-full"
                disabled={settings.cache.currentQueries === 0}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All AI Cache
              </Button>

              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <p className="text-xs font-medium text-blue-900">Current Status</p>
                </div>
                <p className="text-xs text-blue-700 mt-1">
                  AI is configured for <strong>{settings.ai.refreshStrategy.replace('_', ' ')}</strong> with{' '}
                  <strong>{settings.ai.model}</strong> model. Cache is{' '}
                  <strong>{settings.cache.enabled ? 'enabled' : 'disabled'}</strong>.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
