-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVATED', 'INACTIVATED', 'BANNED');

-- CreateEnum
CREATE TYPE "TokenType" AS ENUM ('NATIVE', 'JETTON', 'IN_APP');

-- CreateEnum
CREATE TYPE "WalletType" AS ENUM ('SYSTEM', 'USER');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('DEPOSIT', 'WITHDRAW', 'TRANSFER', 'LOCK', 'UNLOCK');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'PROCESSING', 'TRANSFERRED', 'SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "TonScanConfigStatus" AS ENUM ('ACTIVE', 'RUNNING', 'STOPPED');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "identifier" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVATED',
    "first_name" TEXT,
    "last_name" TEXT,
    "telegram_username" TEXT,
    "language_code" TEXT,
    "allows_write_to_pm" BOOLEAN,
    "telegram_id" TEXT,
    "wallet_address" TEXT,
    "signed_in_at" TIMESTAMP(3),
    "signed_up_at" TIMESTAMP(3),
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "password" TEXT,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "token_type" "TokenType" NOT NULL,
    "wallet_type" "WalletType" NOT NULL,
    "available_balance" TEXT,
    "locked_balance" TEXT,
    "total_balance" TEXT,
    "before_total_balance" TEXT,
    "before_locked_balance" TEXT,
    "before_available_balance" TEXT,
    "last_tx_id" TEXT,
    "last_tx_at" BIGINT,
    "link_ton_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction" (
    "id" TEXT NOT NULL,
    "from_wallet" TEXT,
    "to_wallet" TEXT,
    "from_user_id" TEXT,
    "to_user_id" TEXT,
    "ref_tx_id" TEXT,
    "ref_id" TEXT,
    "symbol" TEXT,
    "token_type" "TokenType" NOT NULL,
    "amount" TEXT NOT NULL,
    "actual_amount" TEXT,
    "txn_fee" TEXT,
    "type" "TransactionType" NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "memo" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ton_scan_config" (
    "id" TEXT NOT NULL,
    "status" "TonScanConfigStatus" DEFAULT 'ACTIVE',
    "last_event_id" TEXT,
    "last_timestamp" BIGINT,
    "last_lt" BIGINT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "ton_scan_config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_identifier_key" ON "user"("identifier");

-- CreateIndex
CREATE INDEX "user_identifier_idx" ON "user"("identifier");

-- CreateIndex
CREATE INDEX "user_telegram_username_idx" ON "user"("telegram_username");

-- CreateIndex
CREATE INDEX "user_telegram_id_idx" ON "user"("telegram_id");

-- CreateIndex
CREATE INDEX "user_wallet_address_idx" ON "user"("wallet_address");

-- CreateIndex
CREATE INDEX "user_created_at_idx" ON "user"("created_at");

-- CreateIndex
CREATE INDEX "user_verified_at_idx" ON "user"("verified_at");

-- CreateIndex
CREATE INDEX "user_signed_up_at_idx" ON "user"("signed_up_at");

-- CreateIndex
CREATE INDEX "wallet_user_id_idx" ON "wallet"("user_id");

-- CreateIndex
CREATE INDEX "wallet_symbol_idx" ON "wallet"("symbol");

-- CreateIndex
CREATE INDEX "wallet_token_type_idx" ON "wallet"("token_type");

-- CreateIndex
CREATE INDEX "wallet_created_at_idx" ON "wallet"("created_at");

-- CreateIndex
CREATE INDEX "wallet_updated_at_idx" ON "wallet"("updated_at");

-- CreateIndex
CREATE INDEX "transaction_from_user_id_idx" ON "transaction"("from_user_id");

-- CreateIndex
CREATE INDEX "transaction_to_user_id_idx" ON "transaction"("to_user_id");

-- CreateIndex
CREATE INDEX "transaction_from_wallet_idx" ON "transaction"("from_wallet");

-- CreateIndex
CREATE INDEX "transaction_to_wallet_idx" ON "transaction"("to_wallet");

-- CreateIndex
CREATE INDEX "transaction_ref_tx_id_idx" ON "transaction"("ref_tx_id");

-- CreateIndex
CREATE INDEX "transaction_ref_id_idx" ON "transaction"("ref_id");

-- CreateIndex
CREATE INDEX "transaction_symbol_idx" ON "transaction"("symbol");

-- CreateIndex
CREATE INDEX "transaction_token_type_idx" ON "transaction"("token_type");

-- CreateIndex
CREATE INDEX "transaction_created_at_idx" ON "transaction"("created_at");

-- CreateIndex
CREATE INDEX "transaction_updated_at_idx" ON "transaction"("updated_at");

-- CreateIndex
CREATE INDEX "ton_scan_config_created_at_idx" ON "ton_scan_config"("created_at");

-- CreateIndex
CREATE INDEX "ton_scan_config_updated_at_idx" ON "ton_scan_config"("updated_at");
