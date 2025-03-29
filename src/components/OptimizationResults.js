import React from 'react';
import { Sun, Clock, Check, X } from 'lucide-react';
import { formatCurrency } from '../utils/goodData';
import { Card, CardHeader, CardTitle, CardContent } from './ui/UIComponents';

const OptimizationResults = ({ optimizedSchedule }) => {
  if (!optimizedSchedule) return null;
  
  return (
    <div className="optimization-results">
      <Card className="optimization-card">
        <CardHeader>
          <CardTitle>Optimization Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="savings-grid">
            <div className="savings-item">
              <p className="savings-label">Daily Savings</p>
              <p className="savings-value">{formatCurrency(optimizedSchedule.savings.daily)}</p>
            </div>
            <div className="savings-item">
              <p className="savings-label">Monthly Savings</p>
              <p className="savings-value">{formatCurrency(optimizedSchedule.savings.monthly)}</p>
            </div>
            <div className="savings-item">
              <p className="savings-label">Yearly Savings</p>
              <p className="savings-value">{formatCurrency(optimizedSchedule.savings.yearly)}</p>
            </div>
          </div>
          
          {optimizedSchedule.recommendations && (
            <div className="recommendations-section">
              <h4 className="recommendations-title">Recommendations:</h4>
              <div className="recommendations-list">
                {optimizedSchedule.recommendations.map((rec, idx) => (
                  <div key={idx} className="recommendation-item">
                    <h5 className="recommendation-period">
                      <span className="period-emoji" role="img" aria-label={rec.period}>{rec.emoji}</span>
                      <span>{rec.period}</span>
                    </h5>
                    <ul className="appliance-list">
                      {rec.appliances.map((app, appIdx) => (
                        <li key={appIdx} className="appliance-item">
                          <Check size={16} className="check-icon" />
                          {app}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="plan-card">
        <CardHeader>
          <CardTitle>
            <Sun size={20} className="title-icon" /> Today's Optimization Plan
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="plan-sections">
            {/* Morning section */}
            <div className="plan-section">
              <h4 className="section-title">
                <div className="section-indicator morning-indicator"></div>
                <Clock size={16} className="clock-icon morning-icon" />
                <span>Morning (6:00 - 12:00) <span role="img" aria-label="Sun">☀️</span></span>
              </h4>
              <ul className="task-list">
                <li className="task-item">
                  <div className="check-circle">
                    <Check size={14} />
                  </div>
                  <span className="task-text">Run washing machine at 9:00-10:00 during solar production peak</span>
                </li>
                <li className="task-item">
                  <div className="check-circle">
                    <Check size={14} />
                  </div>
                  <span className="task-text">Water heater scheduled for 10:00-12:00 to use solar power</span>
                </li>
              </ul>
            </div>
            
            {/* Afternoon section */}
            <div className="plan-section">
              <h4 className="section-title">
                <div className="section-indicator afternoon-indicator"></div>
                <Clock size={16} className="clock-icon afternoon-icon" />
                <span>Afternoon (12:00 - 18:00) <span role="img" aria-label="Sun behind cloud">🌤️</span></span>
              </h4>
              <ul className="task-list">
                <li className="task-item">
                  <div className="check-circle">
                    <Check size={14} />
                  </div>
                  <span className="task-text">Run dryer at 13:00-14:00 during solar production</span>
                </li>
                <li className="task-item">
                  <div className="check-circle">
                    <Check size={14} />
                  </div>
                  <span className="task-text">Charge battery with excess solar production</span>
                </li>
              </ul>
            </div>
            
            {/* Evening section */}
            <div className="plan-section">
              <h4 className="section-title">
                <div className="section-indicator evening-indicator"></div>
                <Clock size={16} className="clock-icon evening-icon" />
                <span>Evening (18:00 - 00:00) <span role="img" aria-label="Moon">🌙</span></span>
              </h4>
              <ul className="task-list">
                <li className="task-item">
                  <div className="check-circle">
                    <Check size={14} />
                  </div>
                  <span className="task-text">Use battery power during peak price hours (18:00-21:00)</span>
                </li>
                <li className="task-item">
                  <div className="x-circle">
                    <X size={14} />
                  </div>
                  <span className="task-text">Avoid running dishwasher, EV charging during peak hours</span>
                </li>
                <li className="task-item">
                  <div className="check-circle">
                    <Check size={14} />
                  </div>
                  <span className="task-text">Schedule dishwasher and EV charging after 22:00 when prices drop</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OptimizationResults;