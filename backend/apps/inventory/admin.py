from django.contrib import admin
from .models import Category, Item, ItemImage


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'parent', 'kind')
    list_filter = ('kind',)
    search_fields = ('name',)
    ordering = ('name',)


class ItemImageInline(admin.TabularInline):
    model = ItemImage
    extra = 1
    fields = ('image', 'is_primary', 'order')


@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'owner_type', 'status', 'listed_price', 'get_quantity_available')
    list_filter = ('status', 'owner_type', 'condition', 'category')
    search_fields = ('title', 'owner__full_name', 'location')
    readonly_fields = ('quantity_sold', 'created_by', 'updated_by', 'created_at', 'updated_at')
    inlines = [ItemImageInline]

    @admin.display(description='Available')
    def get_quantity_available(self, obj):
        return obj.quantity_available


@admin.register(ItemImage)
class ItemImageAdmin(admin.ModelAdmin):
    list_display = ('item', 'is_primary', 'order')
    list_filter = ('is_primary',)
