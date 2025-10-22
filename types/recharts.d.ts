// Type declarations for recharts
declare module 'recharts' {
  export * from 'recharts/types';
}

declare module 'recharts/types' {
  import * as React from 'react';

  export interface LineChartProps {
    data?: any[];
    children?: React.ReactNode;
    [key: string]: any;
  }

  export interface BarChartProps {
    data?: any[];
    children?: React.ReactNode;
    [key: string]: any;
  }

  export interface PieChartProps {
    children?: React.ReactNode;
    [key: string]: any;
  }

  export const LineChart: React.FC<LineChartProps>;
  export const BarChart: React.FC<BarChartProps>;
  export const PieChart: React.FC<PieChartProps>;
  export const Line: React.FC<any>;
  export const Bar: React.FC<any>;
  export const Pie: React.FC<any>;
  export const Cell: React.FC<any>;
  export const XAxis: React.FC<any>;
  export const YAxis: React.FC<any>;
  export const CartesianGrid: React.FC<any>;
  export const Tooltip: React.FC<any>;
  export const Legend: React.FC<any>;
  export const ResponsiveContainer: React.FC<any>;
}

