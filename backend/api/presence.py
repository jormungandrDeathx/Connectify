from django.core.cache import cache


PRESENCE_KEY_PREFIX = "presence:user:"
PRESENCE_TTL = 60

def _key(user_id):
    return f"{PRESENCE_KEY_PREFIX}{user_id}"

def user_connected(user_id):
    cache.set(_key(user_id), True, timeout=PRESENCE_TTL)
    

def refresh_presence(user_id):
    
    if cache.get(_key(user_id)) is None:
        cache.set(_key(user_id), True, timeout=PRESENCE_TTL)
        
    else:
        cache.touch(_key(user_id), timeout=PRESENCE_TTL)


def get_online_users():
    online_ids = cache.keys("presence:user:*")
    
    return [
        {
            "user_id":int(user_id.split(":")[-1]),
            "is_online":True,
            "last_seen":None
        }
        for user_id in online_ids
    ]
    
    
def get_user_presence(user):
    online = cache.get(_key(user.id)) is not None
    
    if online:
        return{
            "user_id":user.id,
            "is_online":True,
            "last_seen":None
        }    
        
    return{
        "user_id":user.id,
        "is_online":False,
        "last_seen":user.profile.last_seen
    }