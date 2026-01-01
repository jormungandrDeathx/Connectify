from api.Models.chat import Conversation

def get_or_create_conversation(user1, user2):
    a,b= sorted([user1.id,user2.id])
    return Conversation.objects.get_or_create(
        user1_id=a,
        user2_id=b
    )
    