import React, { useRef, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ChartComponent({ scores }) {
  const chartRef = useRef(null);

  useEffect(() => {
  }, [scores]);

  const data = {
    labels: Object.keys(scores).filter(k => k!=='overall_weight'),
    datasets: [{
      data: Object.values(scores).filter((_,i,arr)=>Object.keys(scores)[i]!=='overall_weight'),
    }]
  };

  return <Pie ref={chartRef} data={data} />;
}