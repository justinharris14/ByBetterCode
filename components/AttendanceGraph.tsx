
import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { colors } from '@/styles/commonStyles';

interface AttendanceData {
  date: string;
  is_present: boolean;
  child_name?: string;
}

interface AttendanceGraphProps {
  data: AttendanceData[];
  childName?: string;
}

export default function AttendanceGraph({ data, childName }: AttendanceGraphProps) {
  const screenWidth = Dimensions.get('window').width - 40;

  // Process data for the last 30 days
  const processAttendanceData = () => {
    if (data.length === 0) {
      return {
        labels: [],
        datasets: [{ data: [] }],
        presentCount: 0,
        absentCount: 0,
        attendanceRate: 0,
      };
    }

    // Sort by date
    const sortedData = [...data].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Get last 30 days or available data
    const recentData = sortedData.slice(-30);

    // Group by date and count attendance
    const dateMap = new Map<string, { present: number; total: number }>();

    recentData.forEach((record) => {
      const dateKey = new Date(record.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });

      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, { present: 0, total: 0 });
      }

      const entry = dateMap.get(dateKey)!;
      entry.total += 1;
      if (record.is_present) {
        entry.present += 1;
      }
    });

    // Calculate attendance rate per day
    const labels: string[] = [];
    const attendanceRates: number[] = [];

    dateMap.forEach((value, key) => {
      labels.push(key);
      const rate = (value.present / value.total) * 100;
      attendanceRates.push(Math.round(rate));
    });

    // Calculate overall stats
    const presentCount = recentData.filter((r) => r.is_present).length;
    const absentCount = recentData.filter((r) => !r.is_present).length;
    const attendanceRate = recentData.length > 0 
      ? Math.round((presentCount / recentData.length) * 100) 
      : 0;

    return {
      labels: labels.slice(-14), // Show last 14 days
      datasets: [{ data: attendanceRates.slice(-14) }],
      presentCount,
      absentCount,
      attendanceRate,
    };
  };

  const { labels, datasets, presentCount, absentCount, attendanceRate } = processAttendanceData();

  if (data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Attendance History</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No attendance data available</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {childName ? `${childName}'s Attendance` : 'Attendance History'}
      </Text>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, styles.rateCard]}>
          <Text style={styles.statValue}>{attendanceRate}%</Text>
          <Text style={styles.statLabel}>Attendance Rate</Text>
        </View>
        <View style={[styles.statCard, styles.presentCard]}>
          <Text style={styles.statValue}>{presentCount}</Text>
          <Text style={styles.statLabel}>Present</Text>
        </View>
        <View style={[styles.statCard, styles.absentCard]}>
          <Text style={styles.statValue}>{absentCount}</Text>
          <Text style={styles.statLabel}>Absent</Text>
        </View>
      </View>

      {/* Line Chart */}
      {labels.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Last 14 Days Trend</Text>
            <LineChart
              data={{
                labels,
                datasets,
              }}
              width={Math.max(screenWidth, labels.length * 50)}
              height={220}
              chartConfig={{
                backgroundColor: colors.card,
                backgroundGradientFrom: colors.card,
                backgroundGradientTo: colors.card,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(41, 128, 185, ${opacity})`,
                labelColor: (opacity = 1) => colors.textSecondary,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: colors.primary,
                },
                propsForBackgroundLines: {
                  strokeDasharray: '',
                  stroke: colors.border,
                  strokeWidth: 1,
                },
              }}
              bezier
              style={styles.chart}
              formatYLabel={(value) => `${value}%`}
              yAxisSuffix="%"
              yAxisInterval={1}
              fromZero
            />
          </View>
        </ScrollView>
      )}

      {/* Weekly Summary Bar Chart */}
      {labels.length > 0 && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Weekly Summary</Text>
          <BarChart
            data={{
              labels: labels.slice(-7),
              datasets: [
                {
                  data: datasets[0].data.slice(-7),
                },
              ],
            }}
            width={screenWidth}
            height={220}
            yAxisLabel=""
            yAxisSuffix="%"
            chartConfig={{
              backgroundColor: colors.card,
              backgroundGradientFrom: colors.card,
              backgroundGradientTo: colors.card,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(46, 204, 113, ${opacity})`,
              labelColor: (opacity = 1) => colors.textSecondary,
              style: {
                borderRadius: 16,
              },
              propsForBackgroundLines: {
                strokeDasharray: '',
                stroke: colors.border,
                strokeWidth: 1,
              },
            }}
            style={styles.chart}
            fromZero
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderLeftWidth: 4,
  },
  rateCard: {
    borderLeftColor: colors.primary,
  },
  presentCard: {
    borderLeftColor: colors.success,
  },
  absentCard: {
    borderLeftColor: colors.accent,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  chartContainer: {
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  chart: {
    borderRadius: 16,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});
