import { Client } from "@elastic/elasticsearch";

const ELASTIC_URL = process.env.ELASTIC_URL || "";

export const esClient = new Client({ node: ELASTIC_URL });
