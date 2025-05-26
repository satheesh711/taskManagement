import { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const CategoryDistribution = ({ tasks }) => {
  const [chartData, setChartData] = useState(null);
  
  useEffect(() => {
    if (tasks && Array.isArray(tasks) && tasks.length > 0) {
      // Group tasks by category and count
      const categoryCount = tasks.reduce((acc, task) => {
        const category = task.category || 'Uncategorized';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});
      
      // Sort by count (descending)
      const sortedCategories = Object.entries(categoryCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5); // Get top 5
      
      // Prepare chart data
      setChartData({
        labels: sortedCategories.map(([category]) => category),
        datasets: [
          {
            data: sortedCategories.map(([, count]) => count),
            backgroundColor: [
              '#0275d8', // Primary
              '#5cb85c', // Success
              '#f0ad4e', // Warning
              '#d9534f', // Danger
              '#5bc0de', // Info
            ],
            borderWidth: 1,
          },
        ],
      });
    } else {
      setChartData(null);
    }
  }, [tasks]);

  if (!chartData) {
    return (
      <div className="text-center p-4">
        <p className="mb-0 text-muted">No data available</p>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <Doughnut 
        data={chartData} 
        options={{
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                boxWidth: 12,
                padding: 15
              }
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.label || '';
                  const value = context.raw || 0;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = Math.round((value / total) * 100);
                  return `${label}: ${value} (${percentage}%)`;
                }
              }
            }
          }
        }}
        height={200}
      />
    </div>
  );
};

export default CategoryDistribution;