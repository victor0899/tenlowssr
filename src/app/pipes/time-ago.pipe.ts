import {Pipe, PipeTransform, NgZone, ChangeDetectorRef, OnDestroy} from "@angular/core";
import { LangService } from "../services/lang.service";
import { DateTime } from 'luxon';


@Pipe({
	name:'timeAgo'
})

export class TimeAgoPipe implements PipeTransform {

  constructor(
    private lang:LangService
  ) {}

	/**
	 * This function transforms a given date string into a human-friendly message representing the time elapsed
	 * between the given date and the current date. It calculates the elapsed time in seconds, minutes, hours,
	 * days, months, and years. Ex: 10 minutes agos, 1 hour ago, etc.
	 * Then, it returns a respective message based on the elapsed time.
	 *
	 * @param {string} value - a string representing the date to be transformed
	 * @return {string} a human-friendly message representing the time elapsed between the given date and the current date
	 */
	transform(value:string): string {

		const msgAt = DateTime.fromSQL(value); // CREATE AT TIME
		const nowTZ = DateTime.now().setZone('Europe/Madrid');
		const nowDB = DateTime.fromSQL(nowTZ.toFormat('yyyy-MM-dd TT')); // CURRENT TIME
		const diff = nowDB.diff(msgAt, ['years', 'months','days', 'hours', 'minutes', 'seconds']);
		const result = diff.toObject();

		// GET DATA TIMES FROM PARAM
		let seconds = result.seconds ?? 0;
		let minutes = result.minutes ?? 0;
		let hours = result.hours ?? 0
		let days = result.days ?? 0;
		let months = result.months ?? 0;
		let years = result.years ?? 0;

		// RETURN RESPECTIVE MSG

		if(Number.isNaN(seconds)) return '';

		if(hours <= 1 && days < 1 && months < 1 && years < 1){
			if (seconds <= 50 && minutes < 1) return this.lang._msg('a_few_seconds_ago');

			if (seconds <= 90 && minutes <= 1) return this.lang._msg('a_minute_ago');

			if (minutes <= 50 && hours < 1) return this.lang._msg('minutes_ago',{ time: minutes });

			if (minutes <= 90 && hours <= 1) return this.lang._msg('an_hour_ago');
		}

		if( months <= 1 && years < 1){
			if (hours <= 23 && days < 1) return this.lang._msg('hours_ago',{ time: hours });

			if (hours <= 36 && days <= 1) return this.lang._msg('a_day_ago');

			if (days <= 28 && months < 1) return this.lang._msg('days_ago',{ time: days });

			if (days <= 45 && months <= 1) return this.lang._msg('a_month_ago');
		}


		if (days <= 364 && years < 1) return this.lang._msg('months_ago',{ time: months });

		if (days <= 545 && years <= 1) return this.lang._msg('a_year_ago');

		// (days > 545)
		return this.lang._msg('years_ago',{time:years});
	}
}