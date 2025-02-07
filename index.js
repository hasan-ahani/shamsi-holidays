import * as path from 'path'
import * as fs from 'fs'
import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
puppeteer.use(StealthPlugin())

const year = process.argv.slice(2)[0];


;(async () => {
    try {
        const url = "https://www.time.ir/fa/eventyear-تقویم-سال%db%8c%d8%a7%d9%86%d9%87";
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
        const inputYear = "input[type='text']"
        const submitYear = "input[type='submit']"


        // تغییر مقدار اینپوت (سال)
        await page.evaluate((year) => {
            console.log(document.querySelector("input[type='text']"))
            document.querySelector("input[type='text']").value = year
        }, year);

        // کلیک روی دکمه
        await Promise.all([
            page.click(submitYear),
            page.waitForNavigation({ waitUntil: "networkidle2" }) // منتظر لود شدن کامل صفحه
        ]);

        console.log(`✅ سال ${year} لود شد!`);

        // اجرای کد اسکرپینگ در مرورگر
        const holidays = await page.evaluate(() => {
            const events = Array.from(document.querySelectorAll(".eventsCurrentMonthWrapper li"), (node) => ({
                date: document.querySelector("input[type='text']").value + '-' +
                    (Array.from(document.querySelectorAll("div[class='col-md-12']>div>div>span>span>span"),
                        span => span.innerText).findIndex(x => x === node.innerText.split(" ")[1]) + 1).toString().padStart(2, '0') + "-" +
                    node.innerText.split(" ")[0].replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).padStart(2, '0'),
                description: node.innerText.split(" ").slice(2).join(" "),
                is_holiday: node.classList.contains('eventHoliday')
            }));

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
