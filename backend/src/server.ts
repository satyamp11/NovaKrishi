import 'dotenv/config';
import express from 'express';
import { corsOptions } from './config/corsConfig.js';
import { appConfig } from './config/appConfig.js';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authRouter } from './routes/auth.routes.js';
import { userRouter } from './routes/user.routes.js';
import { scanRouter } from './routes/scan.routes.js';
import { alertRouter } from './routes/alert.routes.js';
import { mandiRouter } from './routes/mandi.routes.js';
import marketRatesRouter from './routes/marketRates.routes.js';
import weatherRouter from './routes/weather.routes.js';
import diseaseRouter from './routes/disease.routes.js';
import productRouter from './routes/product.routes.js';
import cartRouter from './routes/cart.routes.js';
import orderRouter from './routes/order.routes.js';
import paymentRouter from './routes/payment.routes.js';
import aiRouter from './routes/ai.routes.js';
import deliveryRouter from './routes/delivery.routes.js';
import bulkRequestRouter from './routes/bulkRequest.routes.js';
import adminRouter from './routes/admin.routes.js';
import reviewRouter from './routes/reviewRoutes.js';
import disputeRouter from './routes/disputeRoutes.js';
import { deliveryController } from './controllers/deliveryController.js';

export const app = express();

app.use(corsOptions);
app.use(express.json());

// Health Check Endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    service: appConfig.appName,
    timestamp: new Date().toISOString()
  });
});

// GET /api/orders/:orderId/tracking alias
app.get('/api/orders/:orderId/tracking', deliveryController.getOrderTracking);

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/products', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', orderRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/delivery', deliveryRouter);
app.use('/api/bulk-requests', bulkRequestRouter);
app.use('/api/admin', adminRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/disputes', disputeRouter);
app.use('/api/ai', aiRouter);
app.use('/api/scans', scanRouter);
app.use('/api/alerts', alertRouter);
app.use('/api/mandi', mandiRouter);
app.use('/api/market-rates', marketRatesRouter);
app.use('/api/weather', weatherRouter);
app.use('/api/disease-scan', diseaseRouter);

// Centralized Error Handler
app.use(errorHandler);

// Start HTTP Server & Connect MongoDB
if (process.env.NODE_ENV !== 'test') {
  app.listen(appConfig.port, async () => {
    console.log(`🚀 ${appConfig.appName} running at http://localhost:${appConfig.port}`);
    await connectDB();
  });
}
