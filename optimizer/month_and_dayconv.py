def day_of_year(month: int, day: int) -> int:
    days_in_month = [31, 28, 31, 30, 31, 30,
                     31, 31, 30, 31, 30, 31]
    
    if not (1 <= month <= 12):
        raise ValueError("Month must be between 1 and 12")
    if not (1 <= day <= days_in_month[month - 1]):
        raise ValueError(f"Invalid day {day} for month {month}")
    
    return sum(days_in_month[:month - 1]) + day