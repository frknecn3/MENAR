import express from 'express';
import announcementsRouter from './routers/announcementsRouter';
import stocksRouter from './routers/stocksRouter';
import globalErrorHandler from './middlewares/globalErrorHandler';

const app = express();

const PORT = 3000;

app.use('/api/announcements', announcementsRouter )

app.use('/api/stocks', stocksRouter )



app.use(globalErrorHandler)

app.listen(PORT, ()=>{
    console.log('Sunucu dinliyor.')
})