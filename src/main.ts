import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { protobufPackage } from './typescript/transactions.pb';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.GRPC,
    options: {
      url: '0.0.0.0:5055',
      protoPath: 'node_modules/grpc-protos/proto/transactions.proto',
      package: protobufPackage,
    },
  });

  await app.listen();
}
bootstrap();

