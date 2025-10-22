import React from 'react';

interface SimpleChartProps {
  type: 'line' | 'bar';
  data: number[];
  labels: string[];
  title: string;
  color?: string;
}

const SimpleChart: React.FC<SimpleChartProps> = ({ 
  type, 
  data, 
  labels, 
  title, 
  color = '#6366f1' 
}) => {
  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue;

  return (
    <div className="simple-chart">
      <h6 className="chart-title">{title}</h6>
      <div className={`chart-container ${type}-chart`}>
        {type === 'line' ? (
          <div className="line-chart">
            <svg viewBox="0 0 400 200" className="chart-svg">
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={color} stopOpacity="0.05" />
                </linearGradient>
              </defs>
              
              {/* Grid lines */}
              {[0, 25, 50, 75, 100].map((percent, index) => (
                <line
                  key={index}
                  x1="0"
                  y1={`${percent}%`}
                  x2="100%"
                  y2={`${percent}%`}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                />
              ))}
              
              {/* Area fill */}
              <path
                d={`M 0,${200 - ((data[0] - minValue) / range) * 200} ${data.map((value, index) => 
                  `L ${(index / (data.length - 1)) * 400},${200 - ((value - minValue) / range) * 200}`
                ).join(' ')} L 400,200 L 0,200 Z`}
                fill="url(#gradient)"
              />
              
              {/* Line */}
              <path
                d={`M 0,${200 - ((data[0] - minValue) / range) * 200} ${data.map((value, index) => 
                  `L ${(index / (data.length - 1)) * 400},${200 - ((value - minValue) / range) * 200}`
                ).join(' ')}`}
                fill="none"
                stroke={color}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Data points */}
              {data.map((value, index) => (
                <circle
                  key={index}
                  cx={(index / (data.length - 1)) * 400}
                  cy={200 - ((value - minValue) / range) * 200}
                  r="4"
                  fill={color}
                  stroke="white"
                  strokeWidth="2"
                />
              ))}
            </svg>
          </div>
        ) : (
          <div className="bar-chart">
            <div className="bars-container">
              {data.map((value, index) => (
                <div key={index} className="bar-item">
                  <div 
                    className="bar"
                    style={{
                      height: `${((value - minValue) / range) * 100}%`,
                      backgroundColor: color
                    }}
                  ></div>
                  <span className="bar-label">{labels[index]}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Legend */}
      <div className="chart-legend">
        {labels.map((label, index) => (
          <div key={index} className="legend-item">
            <span 
              className="legend-color" 
              style={{ backgroundColor: color }}
            ></span>
            <span className="legend-label">{label}</span>
            <span className="legend-value">{data[index]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimpleChart;
