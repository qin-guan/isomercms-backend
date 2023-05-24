import { AttributeValue } from "@aws-sdk/client-dynamodb"
import { DeleteCommandOutput } from "@aws-sdk/lib-dynamodb"
import autoBind from "auto-bind"

import { config } from "@config/config"

import {
  SiteLaunchMessage,
  isSiteLaunchMessage,
} from "@root/../microservices/site-launch/shared/types"

import DynamoDBClient from "./DynamoDBClient"

export default class DynamoDBService {
  private readonly dynamoDBClient: DynamoDBClient

  private readonly TABLE_NAME: string

  constructor({
    dynamoDBClient,
    dynamoDbTableName = config.get("aws.dynamodb.siteLaunchTableName"),
  }: {
    dynamoDBClient: DynamoDBClient
    dynamoDbTableName?: string
  }) {
    this.dynamoDBClient = dynamoDBClient
    this.TABLE_NAME = dynamoDbTableName
    autoBind(this)
  }

  async createItem(message: SiteLaunchMessage): Promise<void> {
    await this.dynamoDBClient.createItem(this.TABLE_NAME, message)
  }

  async getAllCompletedLaunches(): Promise<SiteLaunchMessage[]> {
    const entries = ((
      await this.dynamoDBClient.getAllItems(this.TABLE_NAME)
    ).Items?.filter(isSiteLaunchMessage) as unknown) as SiteLaunchMessage[]

    const completedEntries =
      entries?.filter(
        (entry) =>
          entry.status?.state === "success" || entry.status?.state === "failure"
      ) || []

    // Delete after retrieving the items
    Promise.all(completedEntries.map((entry) => this.deleteItem(entry)))
    return completedEntries
  }

  async deleteItem(message: SiteLaunchMessage): Promise<DeleteCommandOutput> {
    return this.dynamoDBClient.deleteItem(this.TABLE_NAME, {
      appId: message.appId,
    })
  }
}
