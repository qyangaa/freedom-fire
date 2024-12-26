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

  const handleExport = async () => {
    if (chartRef.current) {
      const base64Image = chartRef.current.toBase64Image("image/png", 1.0);

      // Check if it's iOS
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

      if (isIOS) {
        // For iOS devices, create a temporary link and click it
        const link = document.createElement("a");
        link.href = base64Image;
        link.download = `${title.toLowerCase().replace(/\s+/g, "-")}.png`;
        // Add the link to the document
        document.body.appendChild(link);
        // Trigger click
        link.click();
        // Clean up
        document.body.removeChild(link);
      } else if (
        navigator.share &&
        /mobile|android/i.test(navigator.userAgent)
      ) {
        try {
          // Convert base64 to blob
          const response = await fetch(base64Image);
          const blob = await response.blob();
          const file = new File(
            [blob],
            `${title.toLowerCase().replace(/\s+/g, "-")}.png`,
            { type: "image/png" }
          );

          await navigator.share({
            files: [file],
            title: title,
          });
        } catch (error) {
          console.error("Error sharing:", error);
          // Fallback to download
          const downloadLink = document.createElement("a");
          downloadLink.href = base64Image;
          downloadLink.download = `${title
            .toLowerCase()
            .replace(/\s+/g, "-")}.png`;
          downloadLink.click();
        }
      } else {
        // Desktop fallback - direct download
        const downloadLink = document.createElement("a");
        downloadLink.href = base64Image;
        downloadLink.download = `${title
          .toLowerCase()
          .replace(/\s+/g, "-")}.png`;
        downloadLink.click();
      }
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
        {/iPad|iPhone|iPod/.test(navigator.userAgent)
          ? "Save to Photos"
          : /mobile|android/i.test(navigator.userAgent)
          ? "Share"
          : "Export PNG"}
      </button>
    </div>
  );
}
