from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import RetailerProfile
from .serializers import RetailerProfileSerializer
from accounts.permissions import IsRole

class RetailerApplyView(generics.CreateAPIView):
    """Buyer applies to become a retailer."""
    serializer_class = RetailerProfileSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        # Check if already applied
        if RetailerProfile.objects.filter(user=request.user).exists():
            return Response({'detail': 'You already have a retailer application.'}, status=status.HTTP_400_BAD_REQUEST)
        return super().post(request, *args, **kwargs)

class RetailerStatusView(generics.RetrieveAPIView):
    """Retrieve the retailer profile of the current user."""
    serializer_class = RetailerProfileSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return RetailerProfile.objects.get(user=self.request.user)

# Admin views for approval
class RetailerApprovalListView(generics.ListAPIView):
    queryset = RetailerProfile.objects.filter(is_approved=False)
    serializer_class = RetailerProfileSerializer
    permission_classes = (permissions.IsAdminUser,)

class RetailerApproveView(generics.UpdateAPIView):
    queryset = RetailerProfile.objects.all()
    serializer_class = RetailerProfileSerializer
    permission_classes = (permissions.IsAdminUser,)
    lookup_field = 'pk'

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_approved = True
        instance.save()
        return Response({'detail': 'Retailer approved.'}, status=status.HTTP_200_OK)
