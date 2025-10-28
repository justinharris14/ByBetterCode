
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { colors } from '@/styles/commonStyles';

interface AttendanceData {
  date: string;
  present: number;
  absent: number;
  total: number;
}

interface AttendanceGraphProps {
  data: AttendanceData[];
  type?: 'line' | 'bar';
}

export default function AttendanceGraph({ data, type = 'line' }: AttendanceGraphProps) {
  const screenWidth = Dimensions.get('window').width - 40;

  if (data.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>No attendance data available</Text>
      </View>
    );
  }

  const labels = data.map(d => {
    const date = new Date(d.date);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });

  const attendanceRates = data.map(d => 
    d.total > 0 ? Math.round((d.present / d.total) * 100) : 0
  );

  const chartConfig = {
    backgroundColor: colors.white,
    backgroundGradientFrom: colors.white,
    backgroundGradientTo: colors.white,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(169, 214, 229, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 48, 73, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: colors.primary,
    },
  };

  const chartData = {
    labels,
    datasets: [
      {
        data: attendanceRates,
        color: (opacity = 1) => `rgba(169, 214, 229, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Attendance Rate</Text>
        <Text style={styles.subtitle}>Last {data.length} days</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {data.reduce((sum, d) => sum + d.present, 0)}
          </Text>
          <Text style={styles.statLabel}>Present</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {data.reduce((sum, d) => sum + d.absent, 0)}
          </Text>
          <Text style={styles.statLabel}>Absent</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, styles.statValuePrimary]}>
            {Math.round(
              (data.reduce((sum, d) => sum + d.present, 0) /
                data.reduce((sum, d) => sum + d.total, 0)) *
                100
            )}%
          </Text>
          <Text style={styles.statLabel}>Average</Text>
        </View>
      </View>

      {type === 'line' ? (
        <LineChart
          data={chartData}
          width={screenWidth}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          withInnerLines={false}
          withOuterLines={true}
          withVerticalLabels={true}
          withHorizontalLabels={true}
          fromZero
          segments={4}
        />
      ) : (
        <BarChart
          data={chartData}
          width={screenWidth}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
          withInnerLines={false}
          showValuesOnTopOfBars
          fromZero
        />
      )}

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
          <Text style={styles.legendText}>Attendance Rate (%)</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 12,
    backgroundColor: colors.background,
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  statValuePrimary: {
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: colors.text,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
