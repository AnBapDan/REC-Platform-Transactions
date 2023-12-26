-- CreateTable
CREATE TABLE "Accounts" (
    "deviceID" TEXT NOT NULL,
    "accountID" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Accounts_deviceID_key" ON "Accounts"("deviceID");
