import React from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Sun, Battery } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/UIComponents';

/**
 * EnergyTab component showing solar production and battery status
 */
const EnergyTab = ({ currentData, solarEnabled }) => {
  // Render tooltip for charts
  const renderTooltip = (props) => {
    const { active, payload } = props;
    
    if (active && payload && payload.length) {
      return (
        <div className="tooltip">
          <p className="tooltip-time">{`Time: ${payload[0].payload.time}`}</p>
          {payload.map((entry, index) => (
            <p key={index} className="tooltip-value" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value.toFixed(2)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="energy-tab">
      <div className="charts-grid">
        {/* Solar Production Chart */}
        <Card className="chart-card">
          <CardHeader>
            <CardTitle>
              <Sun size={20} className="title-icon" /> Solar Production
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={currentData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="time" tick={{ fontSize: 12 }} interval={2} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={renderTooltip} />
                  <Bar 
                    dataKey="solarProduction" 
                    name="Solar Production (kW)" 
                    fill="#f59e0b" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="solar-summary">
              <p className="solar-summary-title">Solar Production Summary:</p>
              {solarEnabled ? (
                <>
                  <p className="solar-summary-item">
                    Peak production: 3.0 kW at 12:00
                  </p>
                  <p className="solar-summary-item">
                    Total daily production: 29.3 kWh
                  </p>
                  <p className="solar-summary-item consumption-split">
                    Self-consumption: 65% | Grid feed-in: 35%
                  </p>
                </>
              ) : (
                <p className="solar-summary-item">
                  Solar panels are currently disabled. Toggle the switch in the header to simulate solar production.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Battery Management Chart */}
        <Card className="chart-card">
          <CardHeader>
            <CardTitle>
              <Battery size={20} className="title-icon" /> Battery Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={currentData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="time" tick={{ fontSize: 12 }} interval={2} />
                  <YAxis 
                    domain={[0, 100]} 
                    tickFormatter={(v) => `${v}%`}
                    tick={{ fontSize: 12 }} 
                  />
                  <Tooltip content={renderTooltip} />
                  <Line 
                    type="monotone" 
                    dataKey="batteryCharge" 
                    name="Battery Charge (%)" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    dot={{ stroke: '#8b5cf6', fill: '#fff', r: 3 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="battery-strategy">
              <p className="battery-strategy-title">Battery Strategy:</p>
              <ul className="battery-strategy-list">
                {solarEnabled ? (
                  <>
                    <li className="battery-strategy-item">• Charge battery with excess solar (8:00-16:00)</li>
                    <li className="battery-strategy-item">• Use battery during high-price periods (17:00-22:00)</li>
                    <li className="battery-strategy-item">• Maintain minimum 20% battery reserve</li>
                  </>
                ) : (
                  <>
                    <li className="battery-strategy-item">• Charge battery during off-peak hours (00:00-06:00)</li>
                    <li className="battery-strategy-item">• Use battery during high-price periods (17:00-22:00)</li>
                    <li className="battery-strategy-item">• Maintain minimum 20% battery reserve</li>
                  </>
                )}
              </ul>
              <p className="battery-savings">
                Estimated battery savings: {solarEnabled ? '€2.35' : '€1.15'} per day
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Grid Price Analysis */}
      <Card className="chart-card">
        <CardHeader>
          <CardTitle>Grid Price Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={currentData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} interval={2} />
                <YAxis 
                  domain={[0, 0.35]} 
                  tickFormatter={(v) => `€${v.toFixed(2)}`}
                  tick={{ fontSize: 12 }} 
                />
                <Tooltip content={renderTooltip} />
                <Line 
                  type="monotone" 
                  dataKey="gridCost" 
                  name="Grid Price (€/kWh)" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ stroke: '#3b82f6', fill: '#fff', r: 3 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="price-analysis">
            <p className="price-analysis-title">Grid Price Insights:</p>
            <div className="price-insights">
              <div className="price-insight-item">
                <span className="insight-label">Lowest Price:</span>
                <span className="insight-value">€0.06/kWh (02:00-04:00)</span>
              </div>
              <div className="price-insight-item">
                <span className="insight-label">Highest Price:</span>
                <span className="insight-value">€0.30/kWh (20:00)</span>
              </div>
              <div className="price-insight-item">
                <span className="insight-label">Price Ratio:</span>
                <span className="insight-value">5x (Highest/Lowest)</span>
              </div>
            </div>
            <p className="price-recommendation">
              Recommendation: Shift high-load appliances to 00:00-06:00 timeframe to take advantage of lowest prices
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnergyTab;