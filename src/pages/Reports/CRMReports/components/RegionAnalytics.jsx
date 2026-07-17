import { useMemo } from 'react';

import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

import ChartCard from './ChartCard';

import ChartTooltip from './ChartTooltip';

import { toSortedArray, currencyFormat, numberFormat, compactNumberFormat } from '../utils/analyticsHelpers';

import { CHART_PALETTE, CHART_GRID, CHART_AXIS_TEXT, CHART_LABEL_TEXT, CHART_HOVER_FILL } from '../utils/chartTheme';



export function RegionAnalytics({ data, onSelect }) {

  const sorted = useMemo(() => toSortedArray(new Map(data.map((d) => [d.key, d])), 'totalSales'), [data]);



  return (

    <ChartCard title="Sales by Region">

      <div className="h-[240px]">

        <ResponsiveContainer width="100%" height="100%">

          <PieChart>

            <Pie

              data={sorted}

              dataKey="totalSales"

              nameKey="key"

              innerRadius={58}

              outerRadius={86}

              paddingAngle={2}

              onClick={(d) => onSelect('regions', d.key)}

              cursor="pointer"

              isAnimationActive

              animationDuration={350}

            >

              {sorted.map((entry, i) => (

                <Cell key={entry.key} fill={CHART_PALETTE[i % CHART_PALETTE.length]} stroke="var(--card)" strokeWidth={2} />

              ))}

            </Pie>

            <Tooltip

              content={

                <ChartTooltip

                  rows={(payload) => {

                    const d = payload[0]?.payload;

                    if (!d) return [];

                    return [

                      { label: 'Sales', value: currencyFormat(d.totalSales) },

                      { label: 'Tyres', value: numberFormat(d.tyresSold) },

                    ];

                  }}

                />

              }

            />

            <Legend

              verticalAlign="bottom"

              height={28}

              iconType="circle"

              iconSize={8}

              formatter={(value) => <span className="text-[var(--foreground)]/80 text-[12px]">{value}</span>}

            />

          </PieChart>

        </ResponsiveContainer>

      </div>

    </ChartCard>

  );

}



export function StateAnalytics({ data, onSelect }) {

  const sorted = useMemo(() => toSortedArray(new Map(data.map((d) => [d.key, d])), 'totalSales', 10), [data]);



  return (

    <ChartCard title="Top States by Sales">

      <div style={{ height: Math.max(200, sorted.length * 30) }}>

        <ResponsiveContainer width="100%" height="100%">

          <BarChart data={sorted} layout="vertical" margin={{ top: 0, right: 24, left: 0, bottom: 0 }}>

            <CartesianGrid stroke={CHART_GRID} horizontal={false} />

            <XAxis type="number" tick={{ fontSize: 11, fill: CHART_AXIS_TEXT }} axisLine={false} tickLine={false} tickFormatter={compactNumberFormat} />

            <YAxis type="category" dataKey="key" tick={{ fontSize: 11.5, fill: CHART_LABEL_TEXT }} axisLine={false} tickLine={false} width={96} />

            <Tooltip

              cursor={{ fill: CHART_HOVER_FILL }}

              content={

                <ChartTooltip

                  rows={(payload) => {

                    const d = payload[0]?.payload;

                    if (!d) return [];

                    return [{ label: 'Sales', value: currencyFormat(d.totalSales) }];

                  }}

                />

              }

            />

            <Bar

              dataKey="totalSales"

              radius={[0, 6, 6, 0]}

              maxBarSize={18}

              fill="var(--accent)"

              onClick={(d) => onSelect('states', d.key)}

              cursor="pointer"

              isAnimationActive

              animationDuration={350}

            />

          </BarChart>

        </ResponsiveContainer>

      </div>

    </ChartCard>

  );

}