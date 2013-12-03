if (typeof toolkit==='undefined') toolkit={};
toolkit.datePicker = (function () {

    var monthNames=["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ],
        currentDate = {
            day: new Date().getDate(),
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear()
        };

    function daysInMonth(month, year) {
        return [null, 31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
    }

    function firstDay(month, year) {
        var day = new Date(year, month, 1).getDay();
        if (day === 0) {
            return 7;
        } else {
            return day;
        }
    }

    function isLeapYear(year) {
        return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
    }

    function normaliseDate(date){
        return date.length < 2 ? "0" + date : date;
    }

    function DatePicker($container) {
        this.calendarDate = $.extend(currentDate);
        this.$container = $container;
        this.$day = $container.find('.day');
        this.$month = $container.find('.month');
        this.$year = $container.find('.year');
        this.addCalendarHTML();
        this.bindEvents();
    }

    DatePicker.prototype = {

        bindEvents: function() {
            var datePicker = this;

            datePicker.$container
                .on('click','.date', datePicker.selectDate.bind(datePicker))
                .on('click', '.prev', datePicker.displayPreviousMonth.bind(datePicker))
                .on('click', '.next', datePicker.displayNextMonth.bind(datePicker))
                .on('keyup', 'input', datePicker.updateCalendarView.bind(datePicker))
                .on('focus', 'input', function(){ datePicker.$calendar.show();})
                .on('keydown blur', 'input', function(e) {
                    if(e.keyCode == 9 || e.type=='blur') {
                        datePicker.$calendar.hide();
                    }
                });

            $(document)
                .on('keydown', function(e) {
                    if (e.keyCode == 27) {
                        datePicker.$calendar.hide();
                    }
                })
                .on('click', function(e) {
                    if (e.target.class != 'date-picker' && !datePicker.$container.find(e.target).length) {
                        datePicker.$calendar.hide();
                    }
                });
        },

        addCalendarHTML: function() {
            var $calendar = $('<div class="calendar" aria-hidden="true"></div>'),
                $header = $('<div class="header"></div>'),
                $prev = $('<span class="prev"><i class="skycon-arrow-left"></i></span>'),
                $next = $('<span class="next"><i class="skycon-arrow-right"></i></span>'),
                $dateDescription = $('<span data-date></span>'),
                $daysHeader = $('<div class="days"><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span></div>'),
                $dayContainer = $('<div class="daycontainer"></div>');
            $header.append($prev).append($dateDescription).append($next);
            $calendar.append($header).append($daysHeader).append($dayContainer);
            this.$container.append($calendar);
            this.$calendar = $calendar;
            this.$dateDescription = $dateDescription;
            this.$dayContainer = $dayContainer;
            this.renderCalendar();
        },

        renderCalendar: function() {
            var datePicker = this;
            datePicker.$dateDescription.text(monthNames[datePicker.calendarDate.month] + " " + datePicker.calendarDate.year);
            datePicker.fillDays(daysInMonth(datePicker.calendarDate.month, datePicker.calendarDate.year), firstDay(datePicker.calendarDate.month, datePicker.calendarDate.year));
        },

        fillDays: function(noOfDaysInMonth, firstDay) {
            var i= 1,
                date = 1,
                datePicker = this,
                calendarDate = datePicker.calendarDate,
                daysText = [],
                classNames = [],
                isToday = false,
                isInputDate = false,
                isPastDate = false,
                monthIsInPast = (calendarDate.month < currentDate.month && calendarDate.year <= currentDate.year) || (calendarDate.year < currentDate.year),
                monthIsNow = calendarDate.month == currentDate.month && calendarDate.year == currentDate.year,
                monthIsInInput = calendarDate.month ==  datePicker.$month.val() && calendarDate.year ==  datePicker.$year.val();

            for (i; i < firstDay; i++) {
                daysText.push("<span></span>");
            }

            for (date; date <= noOfDaysInMonth; date++) {
                classNames = [];
                isInputDate = (date ==  datePicker.$day.val() && monthIsInInput);
                isPastDate = (date < currentDate.day && monthIsNow) || monthIsInPast;
                isToday = (date == currentDate.day && monthIsNow);

                if (isInputDate) classNames.push('selected');
                if (isPastDate) classNames.push('past');
                if (isToday) classNames.push('today');

                daysText.push("<span class='date " + classNames.join(' ')  + "' >" + date + "</span>");
            }
            datePicker.$dayContainer.html(daysText.join(''));
        },

        selectDate: function(e) {
            var datePicker = this;
            datePicker.$container.find('.selected').removeClass('selected');
            $(e.currentTarget).addClass('selected');
            datePicker.calendarDate.day = parseInt(e.currentTarget.innerText,10);
            datePicker.$day.val(normaliseDate(datePicker.calendarDate.day));
            datePicker.$month.val(normaliseDate(datePicker.calendarDate.month));
            datePicker.$year.val(normaliseDate(datePicker.calendarDate.year));
            datePicker.$calendar.hide();
        },

        displayPreviousMonth: function() {
            var datePicker = this;
            if (datePicker.calendarDate.month === 1) {
                datePicker.calendarDate.month = 12;
                datePicker.calendarDate.year--;
            } else {
                datePicker.calendarDate.month--;
            }
            datePicker.renderCalendar();
        },

        displayNextMonth: function() {
            var datePicker = this;
            if (datePicker.calendarDate.month === 12) {
                datePicker.calendarDate.month = 1;
                datePicker.calendarDate.year++;
            } else {
                datePicker.calendarDate.month++;
            }
            datePicker.renderCalendar();
        },

        updateCalendarView: function(e) {
            var datePicker = this;
            datePicker.calendarDate.day = parseInt(datePicker.$day.val(), 10) || currentDate.day;
            datePicker.calendarDate.month = parseInt(datePicker.$month.val(), 10) || currentDate.month;
            datePicker.calendarDate.year = parseInt(datePicker.$year.val(), 10) || currentDate.year;
            datePicker.renderCalendar();
        }

    };

    $.fn.datePicker = function() {
        return this.each(function() {
            var datePicker = new DatePicker($(this));
        });
    };

    $('.date-picker').datePicker();
}());

if (typeof window.define === "function" && window.define.amd) {
    define('modules/datePicker', [], function() {
        return toolkit.datePicker;
    });
}