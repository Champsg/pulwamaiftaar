export interface RamadanDay {
  day: number;
  date: string;
  sehri: string;
  iftar: string;
}

export interface Region {
  name: string;
  offset: number;
}

export const REGIONS: Region[] = [
  { name: "Srinagar (Base)", offset: 0 },
  { name: "Pulwama, Kulgam, Harmukh", offset: -1 },
  { name: "Islamabad, Tral, Kud", offset: -2 },
  { name: "Pahalgam", offset: -3 },
  { name: "Leh", offset: -11 },
  { name: "Baramulla, Tangmarg, Sopore", offset: 1 },
  { name: "Bandipora, Poonch", offset: 2 },
  { name: "Uri", offset: 3 },
  { name: "Teetwal, Karnah", offset: 4 }
];

export const RAMADAN_TIMETABLE: RamadanDay[] = [
  { day: 1, date: "19-02-2026", sehri: "05:49 AM", iftar: "06:21 PM" },
  { day: 2, date: "20-02-2026", sehri: "05:48 AM", iftar: "06:22 PM" },
  { day: 3, date: "21-02-2026", sehri: "05:47 AM", iftar: "06:23 PM" },
  { day: 4, date: "22-02-2026", sehri: "05:46 AM", iftar: "06:24 PM" },
  { day: 5, date: "23-02-2026", sehri: "05:45 AM", iftar: "06:24 PM" },
  { day: 6, date: "24-02-2026", sehri: "05:44 AM", iftar: "06:25 PM" },
  { day: 7, date: "25-02-2026", sehri: "05:42 AM", iftar: "06:26 PM" },
  { day: 8, date: "26-02-2026", sehri: "05:41 AM", iftar: "06:27 PM" },
  { day: 9, date: "27-02-2026", sehri: "05:40 AM", iftar: "06:28 PM" },
  { day: 10, date: "28-02-2026", sehri: "05:39 AM", iftar: "06:29 PM" },
  { day: 11, date: "01-03-2026", sehri: "05:38 AM", iftar: "06:30 PM" },
  { day: 12, date: "02-03-2026", sehri: "05:37 AM", iftar: "06:31 PM" },
  { day: 13, date: "03-03-2026", sehri: "05:36 AM", iftar: "06:32 PM" },
  { day: 14, date: "04-03-2026", sehri: "05:34 AM", iftar: "06:33 PM" },
  { day: 15, date: "05-03-2026", sehri: "05:33 AM", iftar: "06:33 PM" },
  { day: 16, date: "06-03-2026", sehri: "05:31 AM", iftar: "06:34 PM" },
  { day: 17, date: "07-03-2026", sehri: "05:30 AM", iftar: "06:34 PM" },
  { day: 18, date: "08-03-2026", sehri: "05:28 AM", iftar: "06:35 PM" },
  { day: 19, date: "09-03-2026", sehri: "05:27 AM", iftar: "06:36 PM" },
  { day: 20, date: "10-03-2026", sehri: "05:26 AM", iftar: "06:37 PM" },
  { day: 21, date: "11-03-2026", sehri: "05:25 AM", iftar: "06:38 PM" },
  { day: 22, date: "12-03-2026", sehri: "05:24 AM", iftar: "06:38 PM" },
  { day: 23, date: "13-03-2026", sehri: "05:23 AM", iftar: "06:39 PM" },
  { day: 24, date: "14-03-2026", sehri: "05:20 AM", iftar: "06:40 PM" },
  { day: 25, date: "15-03-2026", sehri: "05:19 AM", iftar: "06:41 PM" },
  { day: 26, date: "16-03-2026", sehri: "05:18 AM", iftar: "06:42 PM" },
  { day: 27, date: "17-03-2026", sehri: "05:16 AM", iftar: "06:42 PM" },
  { day: 28, date: "18-03-2026", sehri: "05:15 AM", iftar: "06:43 PM" },
  { day: 29, date: "19-03-2026", sehri: "05:14 AM", iftar: "06:44 PM" },
  { day: 30, date: "20-03-2026", sehri: "05:12 AM", iftar: "06:45 PM" },
];
