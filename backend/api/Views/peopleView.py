from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import ListAPIView
from rest_framework.filters import SearchFilter

from api.serializers import PeopleSerialiser

from api.Models.user import Profile


class PeopleView(ListAPIView):
    permission_classes=[IsAuthenticated]
    serializer_class = PeopleSerialiser
    queryset = Profile.objects.all()
    filter_backends = [SearchFilter]
    search_fields = ["user__username"]

        