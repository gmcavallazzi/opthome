import React from 'react';
import { ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, Line, Bar } from 'recharts';
import { DollarSign, Sun } from 'lucide-react';
import { formatCurrency } from '../utils/mockData';
import { Card, CardHeader, CardTitle, CardContent } from './ui/UIComponents';

const EnergyCharts = ({ currentData, solarEnabled, optimizedSchedule, totalStandardCost }) => {
  // Calculate savings based on current data
  const totalOptimalCost = currentData.reduce((sum, hour) => sum + hour.optimalCost, 0);
  const savingsAmount = totalStandardCost - totalOptimalCost;
  const savingsPercentage = (savingsAmount / totalStandardCost * 100).toFixed(1);
  
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
    <div className="charts-grid">
      <Card className="chart-card">
        <CardHeader>
          <CardTitle>
            <DollarSign size={20} className="title-icon" /> Cost Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentData && currentData.length > 0 ? (
            <div className="chart-container" style={{height: "300px", width: "100%"}}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={currentData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 12 }} 
                    interval={3} 
                  />
                  <YAxis tick={{ fontSize: 12 }} domain={[0, 1.5]} />
                  <Tooltip content={renderTooltip} />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="standardCost" 
                    name="Standard Usage (€)" 
                    fill="#f87171" 
                    stroke="#ef4444" 
                    activeDot={{ r: 6 }} 
                    fillOpacity={0.6}
                  />
                  {optimizedSchedule ? (
                    <Area 
                      type="monotone" 
                      dataKey="optimizedCost" 
                      name="Python Optimized (€)" 
                      fill="#10b981"
                      stroke="#047857" 
                      strokeWidth={2}
                      fillOpacity={0.6}
                      activeDot={{ r: 6 }}
                    />
                  ) : (
                    <Area 
                      type="monotone" 
                      dataKey="optimalCost" 
                      name="Current Optimization (€)" 
                      fill="#10b981"
                      stroke="#047857" 
                      strokeWidth={2}
                      fillOpacity={0.6}
                      activeDot={{ r: 6 }}
                    />
                  )}
                  <Line 
                    type="monotone" 
                    dataKey="gridCost" 
                    name="Grid Price (€/kWh)" 
                    stroke="#6366f1" 
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="chart-placeholder">
              <p>No data available to display chart</p>
            </div>
          )}
          <div className="savings-note">
            <span>You save {formatCurrency(savingsAmount)} ({savingsPercentage}%) with current optimization</span>
            
            {optimizedSchedule && (
              <p className="python-optimizer-note">
                Python Optimizer: {formatCurrency(optimizedSchedule.savings.daily)} daily savings 
                ({((optimizedSchedule.savings.daily / totalStandardCost) * 100).toFixed(1)}%)
              </p>
            )}
            
            <p className="savings-detail">
              Notice how optimized usage shifts consumption from high-price evening hours (6pm-9pm) to low-price night hours (12am-5am), flattening demand peaks.
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="chart-card">
        <CardHeader>
          <CardTitle>
            <Sun size={20} className="title-icon" /> Solar & Battery Utilization
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentData && currentData.length > 0 ? (
            <div className="chart-container" style={{height: "300px", width: "100%"}}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={currentData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 12 }} 
                    interval={3} 
                  />
                  <YAxis yAxisId="left" tick={{ fontSize: 12 }} domain={[0, 3.1]} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} domain={[0, 100]} />
                  <Tooltip content={renderTooltip} />
                  <Legend />
                  <Bar 
                    yAxisId="left"
                    dataKey="solarProduction" 
                    name="Solar Production (kW)" 
                    fill="#f59e0b" 
                    radius={[4, 4, 0, 0]}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="batteryCharge" 
                    name="Battery Charge (%)" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    dot={{ stroke: '#8b5cf6', fill: '#fff', r: 3 }} 
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="gridCost" 
                    name="Grid Price (€/kWh)" 
                    stroke="#94a3b8" 
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="chart-placeholder">
              <p>No data available to display chart</p>
            </div>
          )}
          <div className="solar-note">
            {solarEnabled ? (
              <span>
                Best times to run high-load appliances: 10:00-16:00 (solar peak)
              </span>
            ) : (
              <span>
                Best times to run high-load appliances: 00:00-06:00 (lowest grid prices)
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnergyCharts;