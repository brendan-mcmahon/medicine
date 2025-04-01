terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

# DynamoDB Table
resource "aws_dynamodb_table" "medicine_table" {
  name           = "Medicine"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "chatId"

  attribute {
    name = "chatId"
    type = "S"
  }
}

# IAM role for Lambda functions
resource "aws_iam_role" "lambda_role" {
  name = "medicine_lambda_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# IAM policy for Lambda functions
resource "aws_iam_role_policy" "lambda_policy" {
  name = "medicine_lambda_policy"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Scan"
        ]
        Resource = aws_dynamodb_table.medicine_table.arn
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      }
    ]
  })
}

# Lambda function 1 - Record medication taken
resource "aws_lambda_function" "record_medication" {
  filename         = "../dist/lambda1.zip"
  function_name    = "record_medication"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs20.x"
  timeout         = 10

  environment {
    variables = {
      TELEGRAM_BOT_TOKEN = var.telegram_bot_token
    }
  }
}

# Lambda function URL for function 1
resource "aws_lambda_function_url" "record_medication_url" {
  function_name      = aws_lambda_function.record_medication.function_name
  authorization_type = "NONE"
}

# Lambda function 2 - Check medication status
resource "aws_lambda_function" "check_medication" {
  filename         = "../dist/lambda2.zip"
  function_name    = "check_medication"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs20.x"
  timeout         = 10

  environment {
    variables = {
      TELEGRAM_BOT_TOKEN = var.telegram_bot_token
    }
  }
}

# EventBridge rule to trigger check_medication Lambda
resource "aws_cloudwatch_event_rule" "check_medication_schedule" {
  name                = "check_medication_schedule"
  description         = "Trigger medication check Lambda function"
  schedule_expression = "cron(0 14 * * ? *)"  # 9 AM Eastern (14:00 UTC)
}

resource "aws_cloudwatch_event_target" "check_medication_target" {
  rule      = aws_cloudwatch_event_rule.check_medication_schedule.name
  target_id = "CheckMedicationLambda"
  arn       = aws_lambda_function.check_medication.arn
}

resource "aws_lambda_permission" "allow_eventbridge" {
  statement_id  = "AllowEventBridgeInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.check_medication.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.check_medication_schedule.arn
} 