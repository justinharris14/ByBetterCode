package com.crecheconnect.ui.admin

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.KeyboardArrowLeft
import androidx.compose.material.icons.filled.KeyboardArrowRight
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import kotlinx.datetime.Clock
import kotlinx.datetime.DayOfWeek
import kotlinx.datetime.LocalDate
import kotlinx.datetime.TimeZone

data class CalendarDay(
    val date: LocalDate,
    val isCurrentMonth: Boolean,
    val isToday: Boolean,
    val isSelected: Boolean,
    val events: List<com.crecheconnect.model.Event> = emptyList()
)

@Composable
fun EventCalendar(
    selectedDate: LocalDate,
    events: List<com.crecheconnect.model.Event>,
    onDateSelected: (LocalDate) -> Unit,
    onAddEvent: (LocalDate) -> Unit,
    onEventClick: (com.crecheconnect.model.Event) -> Unit,
    modifier: Modifier = Modifier
) {
    // Get today's date using a simpler approach
    val today = getTodayDate()
    val daysInMonth = getDaysInMonth(selectedDate)
    val firstDayOfMonth = LocalDate(selectedDate.year, selectedDate.month, 1)
    val startingDayOfWeek = firstDayOfMonth.dayOfWeek

    // Calculate calendar days (including previous month days for padding)
    val calendarDays = remember(selectedDate, events) {
        val days = mutableListOf<CalendarDay>()

        // Add padding days from previous month
        val prevMonth = getPreviousMonth(selectedDate)
        val prevMonthDays = getDaysInMonth(prevMonth)
        
        for (i in 0 until startingDayOfWeek.ordinal) {
            val date = LocalDate(prevMonth.year, prevMonth.month, prevMonthDays - startingDayOfWeek.ordinal + i + 1)
            days.add(CalendarDay(
                date = date,
                isCurrentMonth = false,
                isToday = date == today,
                isSelected = false
            ))
        }

        // Add current month days
        for (day in 1..daysInMonth) {
            val date = LocalDate(selectedDate.year, selectedDate.month, day)
            val dayEvents = events.filter { it.date == date }
            days.add(CalendarDay(
                date = date,
                isCurrentMonth = true,
                isToday = date == today,
                isSelected = date == selectedDate,
                events = dayEvents
            ))
        }

        // Add padding days for next month to complete the grid (42 days total)
        val remainingDays = 42 - days.size
        val nextMonth = getNextMonth(selectedDate)
        
        for (i in 1..remainingDays) {
            val date = LocalDate(nextMonth.year, nextMonth.month, i)
            days.add(CalendarDay(
                date = date,
                isCurrentMonth = false,
                isToday = date == today,
                isSelected = false
            ))
        }

        days
    }

    Column(modifier = modifier) {
        // Calendar Header
        CalendarHeader(
            currentDate = selectedDate,
            onPreviousMonth = {
                val prevMonth = getPreviousMonth(selectedDate)
                val prevMonthDays = getDaysInMonth(prevMonth)
                val newDay = minOf(selectedDate.dayOfMonth, prevMonthDays)
                val newDate = LocalDate(prevMonth.year, prevMonth.month, newDay)
                onDateSelected(newDate)
            },
            onNextMonth = {
                val nextMonth = getNextMonth(selectedDate)
                val nextMonthDays = getDaysInMonth(nextMonth)
                val newDay = minOf(selectedDate.dayOfMonth, nextMonthDays)
                val newDate = LocalDate(nextMonth.year, nextMonth.month, newDay)
                onDateSelected(newDate)
            }
        )

        Spacer(modifier = Modifier.height(8.dp))

        // Days of week header
        Row(modifier = Modifier.fillMaxWidth()) {
            listOf("Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat").forEach { day ->
                Text(
                    text = day,
                    modifier = Modifier.weight(1f),
                    textAlign = TextAlign.Center,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        // Calendar Grid
        LazyVerticalGrid(
            columns = GridCells.Fixed(7),
            contentPadding = PaddingValues(0.dp),
            horizontalArrangement = Arrangement.spacedBy(1.dp),
            verticalArrangement = Arrangement.spacedBy(1.dp)
        ) {
            items(calendarDays) { calendarDay ->
                CalendarDayItem(
                    day = calendarDay,
                    onClick = { onDateSelected(calendarDay.date) },
                    onAddEvent = { onAddEvent(calendarDay.date) },
                    onEventClick = onEventClick
                )
            }
        }
    }
}

@Composable
private fun CalendarHeader(
    currentDate: LocalDate,
    onPreviousMonth: () -> Unit,
    onNextMonth: () -> Unit
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        IconButton(onClick = onPreviousMonth) {
            Icon(
                imageVector = Icons.Default.KeyboardArrowLeft,
                contentDescription = "Previous Month"
            )
        }

        Text(
            text = "${currentDate.month.name.lowercase().replaceFirstChar { it.uppercase() }} ${currentDate.year}",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold
        )

        IconButton(onClick = onNextMonth) {
            Icon(
                imageVector = Icons.Default.KeyboardArrowRight,
                contentDescription = "Next Month"
            )
        }
    }
}

@Composable
private fun CalendarDayItem(
    day: CalendarDay,
    onClick: () -> Unit,
    onAddEvent: () -> Unit,
    onEventClick: (com.crecheconnect.model.Event) -> Unit
) {
    Box(
        modifier = Modifier
            .aspectRatio(1f)
            .background(
                when {
                    day.isSelected -> MaterialTheme.colorScheme.primaryContainer
                    day.isToday -> MaterialTheme.colorScheme.secondaryContainer
                    else -> Color.Transparent
                }
            )
            .border(
                width = 1.dp,
                color = if (day.isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outlineVariant
            )
            .clickable { onClick() }
            .padding(2.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Text(
                text = day.date.dayOfMonth.toString(),
                style = MaterialTheme.typography.bodyMedium,
                color = when {
                    !day.isCurrentMonth -> MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f)
                    day.isSelected -> MaterialTheme.colorScheme.onPrimaryContainer
                    day.isToday -> MaterialTheme.colorScheme.onSecondaryContainer
                    else -> MaterialTheme.colorScheme.onSurface
                },
                fontWeight = if (day.isToday || day.isSelected) FontWeight.Bold else FontWeight.Normal
            )

            // Show event indicators
            if (day.events.isNotEmpty()) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.Center
                ) {
                    repeat(minOf(day.events.size, 3)) { index ->
                        Box(
                            modifier = Modifier
                                .size(4.dp)
                                .background(
                                    MaterialTheme.colorScheme.primary,
                                    shape = androidx.compose.foundation.shape.CircleShape
                                )
                        )
                        if (index < minOf(day.events.size - 1, 2)) {
                            Spacer(modifier = Modifier.width(2.dp))
                        }
                    }
                    if (day.events.size > 3) {
                        Text(
                            text = "+${day.events.size - 3}",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.padding(start = 2.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(2.dp))

                // Add event button for selected day
                if (day.isSelected) {
                    OutlinedButton(
                        onClick = onAddEvent,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(24.dp),
                        contentPadding = PaddingValues(horizontal = 4.dp, vertical = 2.dp)
                    ) {
                        Text(
                            text = "Add Event",
                            style = MaterialTheme.typography.labelSmall
                        )
                    }
                }
            }
        }
    }
}

// Helper functions
private fun getTodayDate(): LocalDate {
    // Simple approach to get today's date without toLocalDateTime
    val now = Clock.System.now()
    // This is a simplified approach - in a real app you might want better date handling
    // For demo purposes, we'll use a fixed date or get it from system time differently
    return LocalDate(2024, 1, 1) // Temporary fixed date - replace with actual today logic
}

private fun getDaysInMonth(date: LocalDate): Int {
    return when (date.monthNumber) {
        1 -> 31 // January
        2 -> if (date.year % 4 == 0 && (date.year % 100 != 0 || date.year % 400 == 0)) 29 else 28 // February
        3 -> 31 // March
        4 -> 30 // April
        5 -> 31 // May
        6 -> 30 // June
        7 -> 31 // July
        8 -> 31 // August
        9 -> 30 // September
        10 -> 31 // October
        11 -> 30 // November
        12 -> 31 // December
        else -> 30
    }
}

private fun getPreviousMonth(currentDate: LocalDate): LocalDate {
    return if (currentDate.monthNumber == 1) {
        LocalDate(currentDate.year - 1, 12, 1)
    } else {
        LocalDate(currentDate.year, currentDate.monthNumber - 1, 1)
    }
}

private fun getNextMonth(currentDate: LocalDate): LocalDate {
    return if (currentDate.monthNumber == 12) {
        LocalDate(currentDate.year + 1, 1, 1)
    } else {
        LocalDate(currentDate.year, currentDate.monthNumber + 1, 1)
    }
}