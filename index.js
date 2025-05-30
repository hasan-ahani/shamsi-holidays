import * as path from 'path'
import * as fs from 'fs'
import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
puppeteer.use(StealthPlugin())

const year = process.argv.slice(2)[0];


;(async () => {
    try {
        const url = "https://www.time.ir/event-year";
        const browser = await puppeteer.launch({
            headless: "new",
            args: ["--no-sandbox", "--disable-setuid-sandbox"]

        });
        const page = await browser.newPage();

        console.log('Setting request interception...')
        await page.setRequestInterception(true)
        page.on('request', (request) => {
            request.continue()
        })

        let response = null
        console.log('Navigating to target website...')
        try {
            response = await page.goto(url, { waitUntil: 'networkidle2', timeout: 40000 })
        } catch (error) {
            console.error('Navigation failed:', error)
            await browser.close()
            process.exit(1)
        }

        const status = response.status()
        const html = await page.content()



        if (status !== 200) {
            console.error(`Failed to load page, status code: ${status}`)
            await browser.close()
            process.exit(1)
        }
        const inputYear = "input#year"
        const submitYear = "button#goToYear"


        // تغییر مقدار اینپوت (سال)
        await page.evaluate((year) => {
            console.log(document.querySelector("input#year"))
            document.querySelector("input#year").value = year
        }, year);

        // کلیک روی دکمه
        await Promise.all([
            page.click(submitYear),
            page.waitForNavigation({ waitUntil: "networkidle2" }) // منتظر لود شدن کامل صفحه
        ]);

        console.log(`✅ سال ${year} لود شد!`);

        // اجرای کد اسکرپینگ در مرورگر
        const holidays = await page.evaluate(() => {
            const events = [];

            document.querySelectorAll('[id^="Month"] div[class^="EventListItem_root__"]').forEach((node) => {
                const dateSpan = node.querySelector("span[class*='date']");
                const descSpan = node.querySelector("span[class*='event']");

                if (!dateSpan || !descSpan) return;

                const dateText = dateSpan.innerText.trim(); // مثل "1 فروردین"
                const description = descSpan.innerText.trim(); // مثل "جشن نوروز/..."

                const [dayPersian, monthName] = dateText.split(" ");

                // تبدیل عدد فارسی به انگلیسی
                const toEnglishDigits = (s) => s.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));

                const day = toEnglishDigits(dayPersian).padStart(2, '0');

                const monthMap = {
                    'فروردین': 1, 'اردیبهشت': 2, 'خرداد': 3, 'تیر': 4,
                    'مرداد': 5, 'شهریور': 6, 'مهر': 7, 'آبان': 8,
                    'آذر': 9, 'دی': 10, 'بهمن': 11, 'اسفند': 12
                };

                const month = String(monthMap[monthName] || 0).padStart(2, '0');

                events.push({
                    date: `${year}-${month}-${day}`,
                    description,
                    is_holiday: dateSpan.className.includes('holiday') || descSpan.className.includes('holiday')
                });
            });

            const groupedEvents = events.reduce((acc, event) => {
                if (!acc[event.date]) {
                    acc[event.date] = {
                        date: event.date,
                        events: [],
                        is_holiday: false
                    };
                }
                acc[event.date].events.push({
                    description: event.description,
                    is_holiday: event.is_holiday
                });
                if (event.is_holiday) {
                    acc[event.date].is_holiday = true;
                }
                return acc;
            }, {});

            return Object.values(groupedEvents);
        });

        await browser.close();

        // ذخیره خروجی در فایل JSON
        const filePath = path.resolve(`./holidays/${year}.json`)
        fs.writeFile(filePath, JSON.stringify(holidays, null, 4), function (err) {
            if (err) {
                console.log(err)
            }
        })
        console.log(`✅ تعطیلات ${year} ذخیره شد: ${filePath}`);
    }catch (e) {

        console.log(`error: ${e}`);
        process.exit(1)
    }
})()
