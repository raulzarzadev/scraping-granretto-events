//@ts-check
const cheerio = require('cheerio');
const request = require('request-promise');
const fs = require('fs-extra');
const writeStreamJSON = fs.createWriteStream('data.json');
const writeStreamCSV = fs.createWriteStream('data.csv');
const URL = 'https://www.masnatacion.com/proximos-eventos-de-aguas-abiertas'

const monthNames = [
    "Enero", "Febrero", "Marzo",
    "Abril", "Mayo", "Junio", "Julio",
    "Agosto", "Septiembre", "Octubre",
    "Noviembre", "Diciembre"
]


async function init() {

    const $ = await request({
        uri: URL,
        transform: body => cheerio.load(body)
    });

    let response = {}
    response.title = $('title').text();


    const events = []
    $('div.container .card-one-line').each((i, el) => {

        const title = $(el).find('.info h5').text()
        console.log(title);
        // console.log( $(el).html());
        const event = {}
        event.Nombre = title
        
        let date=[]
        $(el).find('.date p').each((i, el) => {
            const _date = $(el).text()
            date.push(_date)
        })
        event.Date = date.join('-')
        event.Date = '2022-' + event.Date  
        const getMonthIndex = (MONTH) => {
            const firstThreeLettersOfTheMOnth = MONTH.substring(0, 3)
            const monthStartWith = monthNames.findIndex(month => month.toLowerCase().substring(0, 3) === firstThreeLettersOfTheMOnth.toLowerCase())
            return `0${monthStartWith}`.slice(-2)
        }
        const month = getMonthIndex(date[0])

        event.Date=`2022-${month}-${date[1]}`

        console.log(month);
        event.Lugar = $(el).find('.info p').text().trim()
        event.Estado = $(el).find('.info i').text().trim().split(',')[0]
        event.reference = $(el).find('a').attr('href');
        const style = $(el).find('.preview').attr('style');
        if (typeof style === 'string') event.imageUrl = style.match(/url\((.*)\)/)[1]
        events.push(event)
    })
    response.events = events




    const stringify = JSON.stringify(response)
    writeStreamJSON.write(stringify)

}

init()