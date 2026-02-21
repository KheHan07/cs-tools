// Copyright (c) 2026 WSO2 LLC. (https://www.wso2.com).
//
// WSO2 LLC. licenses this file to you under the Apache License,
// Version 2.0 (the "License"); you may not use this file except
// in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

# Create case classification for the given payload.
#
# + payload - Case classification payload
# + return - Case classification response or error
public isolated function createCaseClassification(CaseClassificationPayload payload)
    returns CaseClassificationResponse|error {

    return aiChatAgentClient->/case_classification.post(payload);
}

# Create a chat for the given payload.
# 
# + projectId - Project ID
# + conversationId - Conversation ID
# + payload - Conversation payload
# + return - Chat response or error
public isolated function createChat(string projectId, string conversationId, ConversationPayload payload)
    returns ChatResponse|error {

    ChatPayload chatPayload = {
        message: payload.message,
        accountId: projectId,
        conversationId: conversationId,
        envProducts: payload.envProducts
    };
    return aiChatAgentClient->/chat.post(chatPayload);
}

# List conversations for the given project ID.
# 
# + projectId - Project ID
# + return - List of conversations or error
public isolated function listConversations(string projectId) returns ConversationListResponse|error {
    return aiChatAgentClient->/chat/conversations/[projectId];
}

# Get chat history.
# 
# + projectId - Project ID
# + conversationId - Conversation ID
# + return - Chat history response or error
public isolated function getChatHistory(string projectId, string conversationId) returns ChatHistoryResponse|error {
    return aiChatAgentClient->/chat/history/[projectId]/[conversationId];
}

# Delete chat conversation.
# 
# + projectId - Project ID
# + conversationId - Conversation ID
# + return - Success message or error
public isolated function deleteChatConversation(string projectId, string conversationId) returns DeleteConversationResponse|error {
    return aiChatAgentClient->/chat/history/[projectId]/[conversationId].delete();
}

# Get recommendation for user query.
# 
# + payload - Recommendation payload
# + return - Recommendation response or error
public isolated function getRecommendation(RecommendationRequest payload) returns RecommendationResponse|error {
    return aiChatAgentClient->/recommendations.post(payload);
}   
