import { useRef } from "react";
import type { ChartData, ChartOptions } from "chart.js";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  SubTitle,
} from "chart.js";
import { Line } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  SubTitle
);

interface ChartExportProps {
  data: ChartData<"line">;
  options: ChartOptions<"line">;
  title: string;
  width?: number;
  height?: number;
}

export default function ChartExport({
  data,
  options,
  title,
  width = 390, // iPhone 12 Pro width
  height = 300,
}: ChartExportProps) {
  const chartRef = useRef<any>(null);

  const handleExport = () => {
    if (chartRef.current) {
      const base64Image = chartRef.current.toBase64Image("image/png", 1.0);
      const downloadLink = document.createElement("a");
      downloadLink.href = base64Image;
      downloadLink.download = `${title.toLowerCase().replace(/\s+/g, "-")}.png`;
      downloadLink.click();
    }
  };

  // Mobile-optimized chart options
  const mobileOptions: ChartOptions<"line"> = {
    ...options,
    responsive: false,
    maintainAspectRatio: false,
    plugins: {
      ...options.plugins,
      legend: {
        ...options.plugins?.legend,
        labels: {
          ...options.plugins?.legend?.labels,
          font: {
            size: 10,
          },
        },
      },
      title: {
        ...options.plugins?.title,
        font: {
          size: 12,
          weight: "bold",
        },
      },
    },
    scales: {
      ...options.scales,
      y: {
        ...options.scales?.y,
        ticks: {
          ...options.scales?.y?.ticks,
          font: {
            size: 10,
          },
        },
        title: {
          ...options.scales?.y?.title,
          font: {
            size: 10,
          },
        },
      },
      x: {
        ...options.scales?.x,
        ticks: {
          ...options.scales?.x?.ticks,
          font: {
            size: 10,
          },
        },
        title: {
          ...options.scales?.x?.title,
          font: {
            size: 10,
          },
        },
      },
    },
  };

  return (
    <div className="relative">
      <Line
        ref={chartRef}
        data={data}
        options={mobileOptions}
        width={width}
        height={height}
      />
      <button
        onClick={handleExport}
        className="absolute top-2 right-2 bg-white bg-opacity-90 text-blue-600 px-2 py-1 rounded text-sm hover:bg-blue-50 transition-colors"
      >
        Export PNG
      </button>
    </div>
  );
}
