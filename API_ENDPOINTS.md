# WIIL JS SDK - API Endpoints Reference

## Account Resources

### OrganizationsResource
| Method | HTTP | Endpoint |
|--------|------|----------|
| `get()` | GET | `/organizations` |

### ProjectsResource `/projects`
| Method | HTTP | Endpoint |
|--------|------|----------|
| `create()` | POST | `/projects` |
| `get(id)` | GET | `/projects/{id}` |
| `getDefault()` | GET | `/projects/default` |
| `update()` | PATCH | `/projects` |
| `delete(id)` | DELETE | `/projects/{id}` |
| `list()` | GET | `/projects` |

---

## Customer Management

### CustomersResource `/customers`
| Method | HTTP | Endpoint |
|--------|------|----------|
| `create()` | POST | `/customers` |
| `get(id)` | GET | `/customers/{id}` |
| `getByPhone(phone)` | GET | `/customers/phone/{phone}` |
| `getByEmail(email)` | GET | `/customers/email/{email}` |
| `search(query)` | GET | `/customers/search` |
| `update(id)` | PATCH | `/customers/{id}` |
| `delete(id)` | DELETE | `/customers/{id}` |
| `list()` | GET | `/customers` |
| `createBatch()` | POST | `/customers/batch` |

### CustomerGroupsResource `/customer-groups`
| Method | HTTP | Endpoint |
|--------|------|----------|
| `create()` | POST | `/customer-groups` |
| `get(id)` | GET | `/customer-groups/{id}` |
| `getByCode(code)` | GET | `/customer-groups/code/{code}` |
| `getDefault()` | GET | `/customer-groups/default` |
| `update(id)` | PATCH | `/customer-groups/{id}` |
| `delete(id)` | DELETE | `/customer-groups/{id}` |
| `list()` | GET | `/customer-groups` |
| `createBatch()` | POST | `/customer-groups/batch` |

### ShippingAddressesResource `/shipping-addresses`
| Method | HTTP | Endpoint |
|--------|------|----------|
| `create()` | POST | `/shipping-addresses` |
| `get(id)` | GET | `/shipping-addresses/{id}` |
| `getByCustomer(id)` | GET | `/shipping-addresses/by-customer/{id}` |
| `getPrimary(customerId)` | GET | `/shipping-addresses/primary/{customerId}` |
| `update(id)` | PATCH | `/shipping-addresses/{id}` |
| `setPrimary(id)` | POST | `/shipping-addresses/{id}/set-primary` |
| `delete(id)` | DELETE | `/shipping-addresses/{id}` |
| `list()` | GET | `/shipping-addresses` |
| `createBatch()` | POST | `/shipping-addresses/batch` |

---

## Menu Management

### MenusResource `/menu-management`
| Method | HTTP | Endpoint |
|--------|------|----------|
| `createCategory()` | POST | `/menu-management/categories` |
| `getCategory(id)` | GET | `/menu-management/categories/{id}` |
| `listCategories()` | GET | `/menu-management/categories` |
| `updateCategory()` | PATCH | `/menu-management/categories` |
| `deleteCategory(id)` | DELETE | `/menu-management/categories/{id}` |
| `createItem()` | POST | `/menu-management/items` |
| `getItem(id)` | GET | `/menu-management/items/{id}` |
| `listItems()` | GET | `/menu-management/items` |
| `getItemsByCategory(id)` | GET | `/menu-management/items/by-category/{id}` |
| `getPopularItems()` | GET | `/menu-management/items/popular` |
| `updateItem()` | PATCH | `/menu-management/items` |
| `deleteItem(id)` | DELETE | `/menu-management/items/{id}` |
| `createCategoryBatch()` | POST | `/menu-management/categories/batch` |
| `createItemBatch()` | POST | `/menu-management/items/batch` |

### MenuItemVariantsResource `/menu-item-variants`
| Method | HTTP | Endpoint |
|--------|------|----------|
| `create()` | POST | `/menu-item-variants` |
| `get(id)` | GET | `/menu-item-variants/{id}` |
| `getByMenuItem(id)` | GET | `/menu-item-variants/by-menu-item/{id}` |
| `getDefault(menuItemId)` | GET | `/menu-item-variants/default/{menuItemId}` |
| `update(id)` | PATCH | `/menu-item-variants/{id}` |
| `delete(id)` | DELETE | `/menu-item-variants/{id}` |
| `list()` | GET | `/menu-item-variants` |
| `createBatch()` | POST | `/menu-item-variants/batch` |

### ModifiersResource `/modifiers`
| Method | HTTP | Endpoint |
|--------|------|----------|
| `createGroup()` | POST | `/modifiers/groups` |
| `getGroup(id)` | GET | `/modifiers/groups/{id}` |
| `listGroups()` | GET | `/modifiers/groups` |
| `updateGroup(id)` | PATCH | `/modifiers/groups/{id}` |
| `deleteGroup(id)` | DELETE | `/modifiers/groups/{id}` |
| `createGroupBatch()` | POST | `/modifiers/groups/batch` |
| `createOption()` | POST | `/modifiers/options` |
| `getOption(id)` | GET | `/modifiers/options/{id}` |
| `getOptionsByGroup(id)` | GET | `/modifiers/options/by-group/{id}` |
| `listOptions()` | GET | `/modifiers/options` |
| `updateOption(id)` | PATCH | `/modifiers/options/{id}` |
| `deleteOption(id)` | DELETE | `/modifiers/options/{id}` |
| `createOptionBatch()` | POST | `/modifiers/options/batch` |
| `createBinding()` | POST | `/modifiers/bindings` |
| `getBinding(id)` | GET | `/modifiers/bindings/{id}` |
| `getBindingsByMenuItem(id)` | GET | `/modifiers/bindings/by-menu-item/{id}` |
| `getBindingsByMenuSet(id)` | GET | `/modifiers/bindings/by-menu-set/{id}` |
| `listBindings()` | GET | `/modifiers/bindings` |
| `updateBinding(id)` | PATCH | `/modifiers/bindings/{id}` |
| `deleteBinding(id)` | DELETE | `/modifiers/bindings/{id}` |
| `createBindingBatch()` | POST | `/modifiers/bindings/batch` |

### MenuSetsResource `/menu-sets`
| Method | HTTP | Endpoint |
|--------|------|----------|
| `create()` | POST | `/menu-sets` |
| `get(id)` | GET | `/menu-sets/{id}` |
| `getByCode(code)` | GET | `/menu-sets/code/{code}` |
| `getActive()` | GET | `/menu-sets/active` |
| `update(id)` | PATCH | `/menu-sets/{id}` |
| `delete(id)` | DELETE | `/menu-sets/{id}` |
| `list()` | GET | `/menu-sets` |
| `createBatch()` | POST | `/menu-sets/batch` |

### MenuPricingRulesResource `/menu-pricing-rules`
| Method | HTTP | Endpoint |
|--------|------|----------|
| `create()` | POST | `/menu-pricing-rules` |
| `get(id)` | GET | `/menu-pricing-rules/{id}` |
| `getByMenuSet(id)` | GET | `/menu-pricing-rules/by-menu-set/{id}` |
| `getByDiscount(id)` | GET | `/menu-pricing-rules/by-discount/{id}` |
| `getActive()` | GET | `/menu-pricing-rules/active` |
| `update(id)` | PATCH | `/menu-pricing-rules/{id}` |
| `delete(id)` | DELETE | `/menu-pricing-rules/{id}` |
| `list()` | GET | `/menu-pricing-rules` |
| `createBatch()` | POST | `/menu-pricing-rules/batch` |

### MenuOrdersResource `/menu-orders`
| Method | HTTP | Endpoint |
|--------|------|----------|
| `create()` | POST | `/menu-orders` |
| `get(id)` | GET | `/menu-orders/{id}` |
| `getByCustomer(id)` | GET | `/menu-orders/by-customer/{id}` |
| `update()` | PATCH | `/menu-orders` |
| `updateStatus(id)` | PATCH | `/menu-orders/{id}/status` |
| `cancel(id)` | POST | `/menu-orders/{id}/cancel` |
| `delete(id)` | DELETE | `/menu-orders/{id}` |
| `list()` | GET | `/menu-orders` |

---

## Product Management

### ProductsResource `/product-management`
| Method | HTTP | Endpoint |
|--------|------|----------|
| `createCategory()` | POST | `/product-management/categories` |
| `getCategory(id)` | GET | `/product-management/categories/{id}` |
| `listCategories()` | GET | `/product-management/categories` |
| `updateCategory()` | PATCH | `/product-management/categories` |
| `deleteCategory(id)` | DELETE | `/product-management/categories/{id}` |
| `create()` | POST | `/product-management/products` |
| `get(id)` | GET | `/product-management/products/{id}` |
| `getBySku(sku)` | GET | `/product-management/products/by-sku/{sku}` |
| `getByBarcode(barcode)` | GET | `/product-management/products/by-barcode/{barcode}` |
| `getByCategory(id)` | GET | `/product-management/products/by-category/{id}` |
| `search(query)` | GET | `/product-management/products/search` |
| `update()` | PATCH | `/product-management/products` |
| `delete(id)` | DELETE | `/product-management/products/{id}` |
| `list()` | GET | `/product-management/products` |
| `createCategoryBatch()` | POST | `/product-management/categories/batch` |
| `createBatch()` | POST | `/product-management/products/batch` |

### ProductVariantsResource `/product-variants`
| Method | HTTP | Endpoint |
|--------|------|----------|
| `create()` | POST | `/product-variants` |
| `get(id)` | GET | `/product-variants/{id}` |
| `getByProduct(id)` | GET | `/product-variants/by-product/{id}` |
| `getBySku(sku)` | GET | `/product-variants/by-sku/{sku}` |
| `getDefault(productId)` | GET | `/product-variants/default/{productId}` |
| `update(id)` | PATCH | `/product-variants/{id}` |
| `delete(id)` | DELETE | `/product-variants/{id}` |
| `list()` | GET | `/product-variants` |
| `createBatch()` | POST | `/product-variants/batch` |

### ProductVariantAxesResource `/product-variant-axes`
| Method | HTTP | Endpoint |
|--------|------|----------|
| `create()` | POST | `/product-variant-axes` |
| `get(id)` | GET | `/product-variant-axes/{id}` |
| `getByName(name)` | GET | `/product-variant-axes/by-name/{name}` |
| `update(id)` | PATCH | `/product-variant-axes/{id}` |
| `delete(id)` | DELETE | `/product-variant-axes/{id}` |
| `list()` | GET | `/product-variant-axes` |
| `createBatch()` | POST | `/product-variant-axes/batch` |

### ProductAxisBindingsResource `/product-axis-bindings`
| Method | HTTP | Endpoint |
|--------|------|----------|
| `create()` | POST | `/product-axis-bindings` |
| `get(id)` | GET | `/product-axis-bindings/{id}` |
| `getByProduct(id)` | GET | `/product-axis-bindings/by-product/{id}` |
| `getByAxis(id)` | GET | `/product-axis-bindings/by-axis/{id}` |
| `update(id)` | PATCH | `/product-axis-bindings/{id}` |
| `delete(id)` | DELETE | `/product-axis-bindings/{id}` |
| `list()` | GET | `/product-axis-bindings` |
| `createBatch()` | POST | `/product-axis-bindings/batch` |

### ProductSetsResource `/product-sets`
| Method | HTTP | Endpoint |
|--------|------|----------|
| `create()` | POST | `/product-sets` |
| `get(id)` | GET | `/product-sets/{id}` |
| `getByCode(code)` | GET | `/product-sets/code/{code}` |
| `getActive()` | GET | `/product-sets/active` |
| `update(id)` | PATCH | `/product-sets/{id}` |
| `delete(id)` | DELETE | `/product-sets/{id}` |
| `list()` | GET | `/product-sets` |
| `createBatch()` | POST | `/product-sets/batch` |

### ProductPricingRulesResource `/product-pricing-rules`
| Method | HTTP | Endpoint |
|--------|------|----------|
| `create()` | POST | `/product-pricing-rules` |
| `get(id)` | GET | `/product-pricing-rules/{id}` |
| `getByProductSet(id)` | GET | `/product-pricing-rules/by-product-set/{id}` |
| `getByDiscount(id)` | GET | `/product-pricing-rules/by-discount/{id}` |
| `getActive()` | GET | `/product-pricing-rules/active` |
| `update(id)` | PATCH | `/product-pricing-rules/{id}` |
| `delete(id)` | DELETE | `/product-pricing-rules/{id}` |
| `list()` | GET | `/product-pricing-rules` |
| `createBatch()` | POST | `/product-pricing-rules/batch` |

### ProductOrdersResource `/product-orders`
| Method | HTTP | Endpoint |
|--------|------|----------|
| `create()` | POST | `/product-orders` |
| `get(id)` | GET | `/product-orders/{id}` |
| `getByCustomer(id)` | GET | `/product-orders/by-customer/{id}` |
| `update()` | PATCH | `/product-orders` |
| `updateStatus(id)` | PATCH | `/product-orders/{id}/status` |
| `cancel(id)` | POST | `/product-orders/{id}/cancel` |
| `delete(id)` | DELETE | `/product-orders/{id}` |
| `list()` | GET | `/product-orders` |

---

## Reservation Management

### TableReservationsResource `/table-reservations`
| Method | HTTP | Endpoint |
|--------|------|----------|
| `create()` | POST | `/table-reservations` |
| `get(id)` | GET | `/table-reservations/{id}` |
| `getByCustomer(id)` | GET | `/table-reservations/by-customer/{id}` |
| `getByResource(id)` | GET | `/table-reservations/by-resource/{id}` |
| `getByDateRange(start, end)` | GET | `/table-reservations/by-date-range` |
| `update(id)` | PATCH | `/table-reservations/{id}` |
| `cancel(id)` | POST | `/table-reservations/{id}/cancel` |
| `delete(id)` | DELETE | `/table-reservations/{id}` |
| `list()` | GET | `/table-reservations` |
| `createBatch()` | POST | `/table-reservations/batch` |

### RoomReservationsResource `/room-reservations`
| Method | HTTP | Endpoint |
|--------|------|----------|
| `create()` | POST | `/room-reservations` |
| `get(id)` | GET | `/room-reservations/{id}` |
| `getByGuest(id)` | GET | `/room-reservations/by-guest/{id}` |
| `getByResource(id)` | GET | `/room-reservations/by-resource/{id}` |
| `getByCheckInRange(start, end)` | GET | `/room-reservations/by-check-in-range` |
| `update(id)` | PATCH | `/room-reservations/{id}` |
| `cancel(id)` | POST | `/room-reservations/{id}/cancel` |
| `delete(id)` | DELETE | `/room-reservations/{id}` |
| `list()` | GET | `/room-reservations` |
| `createBatch()` | POST | `/room-reservations/batch` |

### RentalReservationsResource `/rental-reservations`
| Method | HTTP | Endpoint |
|--------|------|----------|
| `create()` | POST | `/rental-reservations` |
| `get(id)` | GET | `/rental-reservations/{id}` |
| `getByCustomer(id)` | GET | `/rental-reservations/by-customer/{id}` |
| `getByResource(id)` | GET | `/rental-reservations/by-resource/{id}` |
| `getByTier(id)` | GET | `/rental-reservations/by-tier/{id}` |
| `getByDateRange(start, end)` | GET | `/rental-reservations/by-date-range` |
| `update(id)` | PATCH | `/rental-reservations/{id}` |
| `recordReturn(id)` | POST | `/rental-reservations/{id}/return` |
| `cancel(id)` | POST | `/rental-reservations/{id}/cancel` |
| `delete(id)` | DELETE | `/rental-reservations/{id}` |
| `list()` | GET | `/rental-reservations` |
| `createBatch()` | POST | `/rental-reservations/batch` |

### ReservationResourcesResource `/reservation-resources`
| Method | HTTP | Endpoint |
|--------|------|----------|
| `create()` | POST | `/reservation-resources` |
| `get(id)` | GET | `/reservation-resources/{id}` |
| `getByType(type)` | GET | `/reservation-resources/by-type/{type}` |
| `update()` | PATCH | `/reservation-resources` |
| `delete(id)` | DELETE | `/reservation-resources/{id}` |
| `list()` | GET | `/reservation-resources` |
| `createBatch()` | POST | `/reservation-resources/batch` |

### ResourceCategoriesResource `/resource-categories`
| Method | HTTP | Endpoint |
|--------|------|----------|
| `create()` | POST | `/resource-categories` |
| `get(id)` | GET | `/resource-categories/{id}` |
| `getByResourceType(type)` | GET | `/resource-categories/by-type/{type}` |
| `getActive()` | GET | `/resource-categories/active` |
| `update(id)` | PATCH | `/resource-categories/{id}` |
| `delete(id)` | DELETE | `/resource-categories/{id}` |
| `list()` | GET | `/resource-categories` |
| `createBatch()` | POST | `/resource-categories/batch` |

### ResourceInstancesResource `/resource-instances`
| Method | HTTP | Endpoint |
|--------|------|----------|
| `create()` | POST | `/resource-instances` |
| `get(id)` | GET | `/resource-instances/{id}` |
| `getByResource(id)` | GET | `/resource-instances/by-resource/{id}` |
| `getByStatus(status)` | GET | `/resource-instances/by-status/{status}` |
| `getAvailable()` | GET | `/resource-instances/available` |
| `update(id)` | PATCH | `/resource-instances/{id}` |
| `updateStatus(id)` | PATCH | `/resource-instances/{id}/status` |
| `delete(id)` | DELETE | `/resource-instances/{id}` |
| `list()` | GET | `/resource-instances` |
| `createBatch()` | POST | `/resource-instances/batch` |

### ReservationSettingsResource `/reservation-settings`
| Method | HTTP | Endpoint |
|--------|------|----------|
| `create()` | POST | `/reservation-settings` |
| `get(id)` | GET | `/reservation-settings/{id}` |
| `getByLocation(id)` | GET | `/reservation-settings/by-location/{id}` |
| `update()` | PATCH | `/reservation-settings` |
| `delete(id)` | DELETE | `/reservation-settings/{id}` |
| `list()` | GET | `/reservation-settings` |

### FloorPlansResource `/floor-plans`
| Method | HTTP | Endpoint |
|--------|------|----------|
| `create()` | POST | `/floor-plans` |
| `get(id)` | GET | `/floor-plans/{id}` |
| `getByLocation(id)` | GET | `/floor-plans/by-location/{id}` |
| `getActive()` | GET | `/floor-plans/active` |
| `update()` | PATCH | `/floor-plans` |
| `delete(id)` | DELETE | `/floor-plans/{id}` |
| `list()` | GET | `/floor-plans` |

### FloorPlanSectionsResource `/floor-plan-sections`
| Method | HTTP | Endpoint |
|--------|------|----------|
| `create()` | POST | `/floor-plan-sections` |
| `get(id)` | GET | `/floor-plan-sections/{id}` |
| `getByFloorPlan(id)` | GET | `/floor-plan-sections/by-floor-plan/{id}` |
| `update()` | PATCH | `/floor-plan-sections` |
| `delete(id)` | DELETE | `/floor-plan-sections/{id}` |
| `list()` | GET | `/floor-plan-sections` |
| `addTablePlacement(sectionId)` | POST | `/floor-plan-sections/{id}/table-placements` |
| `getTablePlacement(sectionId, placementId)` | GET | `/floor-plan-sections/{id}/table-placements/{placementId}` |
| `updateTablePlacement(sectionId)` | PATCH | `/floor-plan-sections/{id}/table-placements` |
| `removeTablePlacement(sectionId, placementId)` | DELETE | `/floor-plan-sections/{id}/table-placements/{placementId}` |

### MaintenanceBlocksResource `/maintenance-blocks`
| Method | HTTP | Endpoint |
|--------|------|----------|
| `create()` | POST | `/maintenance-blocks` |
| `get(id)` | GET | `/maintenance-blocks/{id}` |
| `getByResourceInstance(id)` | GET | `/maintenance-blocks/by-resource-instance/{id}` |
| `getByLocation(id)` | GET | `/maintenance-blocks/by-location/{id}` |
| `getByDateRange(start, end)` | GET | `/maintenance-blocks/by-date-range` |
| `update()` | PATCH | `/maintenance-blocks` |
| `delete(id)` | DELETE | `/maintenance-blocks/{id}` |
| `list()` | GET | `/maintenance-blocks` |
| `createBatch()` | POST | `/maintenance-blocks/batch` |

### TableAssignmentsResource `/table-assignments`
| Method | HTTP | Endpoint |
|--------|------|----------|
| `create()` | POST | `/table-assignments` |
| `get(id)` | GET | `/table-assignments/{id}` |
| `getByReservation(id)` | GET | `/table-assignments/by-reservation/{id}` |
| `getByTableInstance(id)` | GET | `/table-assignments/by-table-instance/{id}` |
| `getByStatus(status)` | GET | `/table-assignments/by-status` |
| `update()` | PATCH | `/table-assignments` |
| `release(id)` | POST | `/table-assignments/{id}/release` |
| `delete(id)` | DELETE | `/table-assignments/{id}` |
| `list()` | GET | `/table-assignments` |

### RoomAssignmentsResource `/room-assignments`
| Method | HTTP | Endpoint |
|--------|------|----------|
| `create()` | POST | `/room-assignments` |
| `get(id)` | GET | `/room-assignments/{id}` |
| `getByReservation(id)` | GET | `/room-assignments/by-reservation/{id}` |
| `getByRoomInstance(id)` | GET | `/room-assignments/by-room-instance/{id}` |
| `getByStatus(status)` | GET | `/room-assignments/by-status` |
| `update()` | PATCH | `/room-assignments` |
| `release(id)` | POST | `/room-assignments/{id}/release` |
| `delete(id)` | DELETE | `/room-assignments/{id}` |
| `list()` | GET | `/room-assignments` |

### RentalAssignmentsResource `/rental-assignments`
| Method | HTTP | Endpoint |
|--------|------|----------|
| `create()` | POST | `/rental-assignments` |
| `get(id)` | GET | `/rental-assignments/{id}` |
| `getByReservation(id)` | GET | `/rental-assignments/by-reservation/{id}` |
| `getByRentalInstance(id)` | GET | `/rental-assignments/by-rental-instance/{id}` |
| `getByStatus(status)` | GET | `/rental-assignments/by-status` |
| `getWithDamage()` | GET | `/rental-assignments/with-damage` |
| `update()` | PATCH | `/rental-assignments` |
| `release(id)` | POST | `/rental-assignments/{id}/release` |
| `delete(id)` | DELETE | `/rental-assignments/{id}` |
| `list()` | GET | `/rental-assignments` |

---

## Service Management

### BusinessServicesResource `/business-services`
| Method | HTTP | Endpoint |
|--------|------|----------|
| `create()` | POST | `/business-services` |
| `get(id)` | GET | `/business-services/{id}` |
| `update()` | PATCH | `/business-services` |
| `delete(id)` | DELETE | `/business-services/{id}` |
| `list()` | GET | `/business-services` |
| `getCatalog()` | GET | `/business-services/catalog` |
| `createBatch()` | POST | `/business-services/batch` |

### ServiceCategoriesResource `/service-categories`
| Method | HTTP | Endpoint |
|--------|------|----------|
| `create()` | POST | `/service-categories` |
| `get(id)` | GET | `/service-categories/{id}` |
| `update()` | PATCH | `/service-categories` |
| `delete(id)` | DELETE | `/service-categories/{id}` |
| `list()` | GET | `/service-categories` |
| `createBatch()` | POST | `/service-categories/batch` |

### ServiceAppointmentsResource `/service-appointments`
| Method | HTTP | Endpoint |
|--------|------|----------|
| `create()` | POST | `/service-appointments` |
| `get(id)` | GET | `/service-appointments/{id}` |
| `getByCustomer(id)` | GET | `/service-appointments/by-customer/{id}` |
| `getByService(id)` | GET | `/service-appointments/by-service/{id}` |
| `getByProvider(id)` | GET | `/service-appointments/by-provider/{id}` |
| `getByDateRange(start, end)` | GET | `/service-appointments/by-date-range` |
| `update()` | PATCH | `/service-appointments` |
| `updateStatus(id)` | PATCH | `/service-appointments/{id}/status` |
| `cancel(id)` | POST | `/service-appointments/{id}/cancel` |
| `reschedule(id)` | POST | `/service-appointments/{id}/reschedule` |
| `delete(id)` | DELETE | `/service-appointments/{id}` |
| `list()` | GET | `/service-appointments` |
| `createBatch()` | POST | `/service-appointments/batch` |
| `queryAvailableSlots()` | POST | `/service-appointments/query-slots` |

### ServicePersonsResource `/service-persons`
| Method | HTTP | Endpoint |
|--------|------|----------|
| `create()` | POST | `/service-persons` |
| `get(id)` | GET | `/service-persons/{id}` |
| `getByLocation(id)` | GET | `/service-persons/by-location/{id}` |
| `update()` | PATCH | `/service-persons` |
| `delete(id)` | DELETE | `/service-persons/{id}` |
| `list()` | GET | `/service-persons` |
| `createBatch()` | POST | `/service-persons/batch` |

### ServiceProvidersResource `/service-providers`
| Method | HTTP | Endpoint |
|--------|------|----------|
| `create()` | POST | `/service-providers` |
| `get(id)` | GET | `/service-providers/{id}` |
| `getByService(id)` | GET | `/service-providers/by-service/{id}` |
| `getByProvider(id)` | GET | `/service-providers/by-provider/{id}` |
| `update()` | PATCH | `/service-providers` |
| `delete(id)` | DELETE | `/service-providers/{id}` |
| `list()` | GET | `/service-providers` |
| `createBatch()` | POST | `/service-providers/batch` |

### ServicePricingRulesResource `/service-pricing-rules`
| Method | HTTP | Endpoint |
|--------|------|----------|
| `create()` | POST | `/service-pricing-rules` |
| `get(id)` | GET | `/service-pricing-rules/{id}` |
| `getByLocation(id)` | GET | `/service-pricing-rules/by-location/{id}` |
| `update()` | PATCH | `/service-pricing-rules` |
| `delete(id)` | DELETE | `/service-pricing-rules/{id}` |
| `list()` | GET | `/service-pricing-rules` |
| `createBatch()` | POST | `/service-pricing-rules/batch` |

### ServiceTimeOffsResource `/service-time-offs`
| Method | HTTP | Endpoint |
|--------|------|----------|
| `create()` | POST | `/service-time-offs` |
| `get(id)` | GET | `/service-time-offs/{id}` |
| `getByProvider(id)` | GET | `/service-time-offs/by-provider/{id}` |
| `getByDateRange(start, end)` | GET | `/service-time-offs/by-date-range` |
| `update()` | PATCH | `/service-time-offs` |
| `approve(id)` | POST | `/service-time-offs/{id}/approve` |
| `reject(id)` | POST | `/service-time-offs/{id}/reject` |
| `delete(id)` | DELETE | `/service-time-offs/{id}` |
| `list()` | GET | `/service-time-offs` |
| `createBatch()` | POST | `/service-time-offs/batch` |

### AppointmentAdditionalInfoResource `/appointment-additional-info`

| Method | HTTP | Endpoint |
|--------|------|----------|
| `create()` | POST | `/appointment-additional-info` |
| `get(id)` | GET | `/appointment-additional-info/{id}` |
| `getByAppointment(id)` | GET | `/appointment-additional-info/by-appointment/{id}` |
| `getByCustomer(id)` | GET | `/appointment-additional-info/by-customer/{id}` |
| `getByBusinessService(id)` | GET | `/appointment-additional-info/by-business-service/{id}` |
| `update()` | PATCH | `/appointment-additional-info` |
| `delete(id)` | DELETE | `/appointment-additional-info/{id}` |
| `list()` | GET | `/appointment-additional-info` |

### AppointmentFieldConfigsResource `/appointment-field-configs`

| Method | HTTP | Endpoint |
|--------|------|----------|
| `create()` | POST | `/appointment-field-configs` |
| `get(id)` | GET | `/appointment-field-configs/{id}` |
| `getWithEmailRequired()` | GET | `/appointment-field-configs/with-email-required` |
| `getWithPhoneRequired()` | GET | `/appointment-field-configs/with-phone-required` |
| `getWithReuseEnabled()` | GET | `/appointment-field-configs/with-reuse-enabled` |
| `update()` | PATCH | `/appointment-field-configs` |
| `delete(id)` | DELETE | `/appointment-field-configs/{id}` |
| `list()` | GET | `/appointment-field-configs` |

---

## Pricing Rules

### TaxRulesResource `/tax-rules`

| Method | HTTP | Endpoint |
|--------|------|----------|
| `create()` | POST | `/tax-rules` |
| `get(id)` | GET | `/tax-rules/{id}` |
| `getByLocation(id)` | GET | `/tax-rules/by-location/{id}` |
| `getByScope(scope)` | GET | `/tax-rules/by-scope` |
| `getByRateType(rateType)` | GET | `/tax-rules/by-rate-type` |
| `getActive()` | GET | `/tax-rules/active` |
| `update()` | PATCH | `/tax-rules` |
| `delete(id)` | DELETE | `/tax-rules/{id}` |
| `list()` | GET | `/tax-rules` |
| `createBatch()` | POST | `/tax-rules/batch` |

### DiscountRulesResource `/discount-rules`

| Method | HTTP | Endpoint |
|--------|------|----------|
| `create()` | POST | `/discount-rules` |
| `get(id)` | GET | `/discount-rules/{id}` |
| `getByLocation(id)` | GET | `/discount-rules/by-location/{id}` |
| `getByCode(code)` | GET | `/discount-rules/by-code/{code}` |
| `getByScope(scope)` | GET | `/discount-rules/by-scope` |
| `getByType(type)` | GET | `/discount-rules/by-type` |
| `getActive()` | GET | `/discount-rules/active` |
| `getStackable()` | GET | `/discount-rules/stackable` |
| `update()` | PATCH | `/discount-rules` |
| `delete(id)` | DELETE | `/discount-rules/{id}` |
| `list()` | GET | `/discount-rules` |
| `createBatch()` | POST | `/discount-rules/batch` |

---

## Property Management

### PropertyConfigResource `/property-management`
| Method | HTTP | Endpoint |
|--------|------|----------|
| `createCategory()` | POST | `/property-management/categories` |
| `getCategory(id)` | GET | `/property-management/categories/{id}` |
| `listCategories()` | GET | `/property-management/categories` |
| `updateCategory()` | PATCH | `/property-management/categories` |
| `deleteCategory(id)` | DELETE | `/property-management/categories/{id}` |
| `createAddress()` | POST | `/property-management/addresses` |
| `getAddress(id)` | GET | `/property-management/addresses/{id}` |
| `listAddresses()` | GET | `/property-management/addresses` |
| `updateAddress()` | PATCH | `/property-management/addresses` |
| `deleteAddress(id)` | DELETE | `/property-management/addresses/{id}` |
| `verifyAddress(id)` | POST | `/property-management/addresses/{id}/verify` |
| `create()` | POST | `/property-management/properties` |
| `get(id)` | GET | `/property-management/properties/{id}` |
| `list()` | GET | `/property-management/properties` |
| `getByCategory(id)` | GET | `/property-management/properties/by-category/{id}` |
| `getByAddress(id)` | GET | `/property-management/properties/by-address/{id}` |
| `search(query)` | GET | `/property-management/properties/search` |
| `update()` | PATCH | `/property-management/properties` |
| `delete(id)` | DELETE | `/property-management/properties/{id}` |
| `createCategoryBatch()` | POST | `/property-management/categories/batch` |
| `createAddressBatch()` | POST | `/property-management/addresses/batch` |
| `createBatch()` | POST | `/property-management/properties/batch` |

### PropertyInquiryResource `/property-inquiries`
| Method | HTTP | Endpoint |
|--------|------|----------|
| `create()` | POST | `/property-inquiries` |
| `get(id)` | GET | `/property-inquiries/{id}` |
| `getByProperty(id)` | GET | `/property-inquiries/by-property/{id}` |
| `getByCustomer(id)` | GET | `/property-inquiries/by-customer/{id}` |
| `update()` | PATCH | `/property-inquiries` |
| `updateStatus(id)` | PATCH | `/property-inquiries/{id}/status` |
| `delete(id)` | DELETE | `/property-inquiries/{id}` |
| `list()` | GET | `/property-inquiries` |

---

## AI Service Management

### AgentConfigurationsResource `/agent-configurations`
| Method | HTTP | Endpoint |
|--------|------|----------|
| `create()` | POST | `/agent-configurations` |
| `get(id)` | GET | `/agent-configurations/{id}` |
| `update()` | PATCH | `/agent-configurations` |
| `delete(id)` | DELETE | `/agent-configurations/{id}` |
| `list()` | GET | `/agent-configurations` |

### DeploymentConfigurationsResource `/deployment-configurations`
| Method | HTTP | Endpoint |
|--------|------|----------|
| `create()` | POST | `/deployment-configurations` |
| `createChain()` | POST | `/deployment-configurations` |
| `get(id)` | GET | `/deployment-configurations/{id}` |
| `getByChannel(id)` | GET | `/deployment-configurations/by-channel/{id}` |
| `update()` | PATCH | `/deployment-configurations` |
| `delete(id)` | DELETE | `/deployment-configurations/{id}` |
| `list()` | GET | `/deployment-configurations` |
| `listByProject(id)` | GET | `/deployment-configurations/by-project/{id}` |
| `listByAgent(id)` | GET | `/deployment-configurations/by-agent/{id}` |
| `listByInstruction(id)` | GET | `/deployment-configurations/by-instruction/{id}` |

### DeploymentChannelsResource `/deployment-channels`
| Method | HTTP | Endpoint |
|--------|------|----------|
| `create()` | POST | `/deployment-channels` |
| `get(id)` | GET | `/deployment-channels/{id}` |
| `update()` | PATCH | `/deployment-channels` |
| `delete(id)` | DELETE | `/deployment-channels/{id}` |
| `list()` | GET | `/deployment-channels` |

### InstructionConfigurationsResource `/instruction-configurations`
| Method | HTTP | Endpoint |
|--------|------|----------|
| `create()` | POST | `/instruction-configurations` |
| `get(id)` | GET | `/instruction-configurations/{id}` |
| `update()` | PATCH | `/instruction-configurations` |
| `delete(id)` | DELETE | `/instruction-configurations/{id}` |
| `list()` | GET | `/instruction-configurations` |

### PhoneConfigurationsResource `/phone-configurations`
| Method | HTTP | Endpoint |
|--------|------|----------|
| `create()` | POST | `/phone-configurations` |
| `get(id)` | GET | `/phone-configurations/{id}` |
| `update()` | PATCH | `/phone-configurations` |
| `delete(id)` | DELETE | `/phone-configurations/{id}` |
| `list()` | GET | `/phone-configurations` |

### ProvisioningConfigurationsResource `/provisioning-configurations`
| Method | HTTP | Endpoint |
|--------|------|----------|
| `create()` | POST | `/provisioning-configurations` |
| `get(id)` | GET | `/provisioning-configurations/{id}` |
| `update()` | PATCH | `/provisioning-configurations` |
| `delete(id)` | DELETE | `/provisioning-configurations/{id}` |
| `list()` | GET | `/provisioning-configurations` |

### ConversationConfigurationsResource `/conversation-configurations`
| Method | HTTP | Endpoint |
|--------|------|----------|
| `create()` | POST | `/conversation-configurations` |
| `get(id)` | GET | `/conversation-configurations/{id}` |
| `update()` | PATCH | `/conversation-configurations` |
| `delete(id)` | DELETE | `/conversation-configurations/{id}` |
| `list()` | GET | `/conversation-configurations` |

### TranslationSessionsResource `/translation-sessions`
| Method | HTTP | Endpoint |
|--------|------|----------|
| `create()` | POST | `/translation-sessions` |
| `get(id)` | GET | `/translation-sessions/{id}` |
| `update()` | PATCH | `/translation-sessions` |
| `delete(id)` | DELETE | `/translation-sessions/{id}` |
| `list()` | GET | `/translation-sessions` |

### KnowledgeSourcesResource `/knowledge-sources`
| Method | HTTP | Endpoint |
|--------|------|----------|
| `create()` | POST | `/knowledge-sources` |
| `get(id)` | GET | `/knowledge-sources/{id}` |
| `update()` | PATCH | `/knowledge-sources` |
| `delete(id)` | DELETE | `/knowledge-sources/{id}` |
| `list()` | GET | `/knowledge-sources` |

### SupportModelsResource `/support-models`
| Method | HTTP | Endpoint |
|--------|------|----------|
| `getDefaultMultiMode()` | GET | `/support-models/default/multi-mode` |
| `list()` | GET | `/support-models` |

### TelephonyProviderResource `/telephony`
| Method | HTTP | Endpoint |
|--------|------|----------|
| `getRegions(provider)` | GET | `/telephony/{provider}/regions` |
| `getPhoneNumbers(provider, region)` | GET | `/telephony/{provider}/phone-numbers` |
| `getPricing(provider, region)` | GET | `/telephony/{provider}/pricing` |

### DynamicPhoneAgentResource `/dynamic-agents/phone`
| Method | HTTP | Endpoint |
|--------|------|----------|
| `create()` | POST | `/dynamic-agents/phone` |
| `get(id)` | GET | `/dynamic-agents/phone/{id}` |
| `update(id)` | PATCH | `/dynamic-agents/phone/{id}` |
| `delete(id)` | DELETE | `/dynamic-agents/phone/{id}` |

### DynamicWebAgentResource `/dynamic-agents/web`
| Method | HTTP | Endpoint |
|--------|------|----------|
| `create()` | POST | `/dynamic-agents/web` |
| `get(id)` | GET | `/dynamic-agents/web/{id}` |
| `update(id)` | PATCH | `/dynamic-agents/web/{id}` |
| `delete(id)` | DELETE | `/dynamic-agents/web/{id}` |

### DynamicAgentStatusResource `/dynamic-agents/status`
| Method | HTTP | Endpoint |
|--------|------|----------|
| `get(id)` | GET | `/dynamic-agents/status/{id}` |
| `poll(id, options)` | GET | `/dynamic-agents/status/{id}` (polling) |

---

## Conversation Resources

### ConversationsResource `/conversations`
| Method | HTTP | Endpoint |
|--------|------|----------|
| `get(id)` | GET | `/conversations/{id}` |
| `getByCustomer(id)` | GET | `/conversations/by-customer/{id}` |
| `getByChannel(id)` | GET | `/conversations/by-channel/{id}` |
| `getByDeployment(id)` | GET | `/conversations/by-deployment/{id}` |
| `getByDateRange(start, end)` | GET | `/conversations/by-date-range` |
| `updateStatus(id)` | PATCH | `/conversations/{id}/status` |
| `getMessages(id)` | GET | `/conversations/{id}/messages` |
| `generateSummary(id)` | POST | `/conversations/{id}/generate-summary` |
| `delete(id)` | DELETE | `/conversations/{id}` |
| `list()` | GET | `/conversations` |

### OutboundCallsResource `/outbound-calls`
| Method | HTTP | Endpoint |
|--------|------|----------|
| `create()` | POST | `/outbound-calls` |
| `get(id)` | GET | `/outbound-calls/{id}` |
| `getByAgent(id)` | GET | `/outbound-calls/by-agent/{id}` |
| `getByStatus(status)` | GET | `/outbound-calls/by-status` |
| `getByDateRange(start, end)` | GET | `/outbound-calls/by-date-range` |
| `update()` | PATCH | `/outbound-calls` |
| `updateStatus(id)` | PATCH | `/outbound-calls/{id}/status` |
| `cancel(id)` | POST | `/outbound-calls/{id}/cancel` |
| `retry(id)` | POST | `/outbound-calls/{id}/retry` |
| `delete(id)` | DELETE | `/outbound-calls/{id}` |
| `list()` | GET | `/outbound-calls` |
| `createBatch()` | POST | `/outbound-calls/batch` |

### OutboundEmailsResource `/outbound-emails`
| Method | HTTP | Endpoint |
|--------|------|----------|
| `create()` | POST | `/outbound-emails` |
| `get(id)` | GET | `/outbound-emails/{id}` |
| `getByStatus(status)` | GET | `/outbound-emails/by-status` |
| `getByTemplate(id)` | GET | `/outbound-emails/by-template/{id}` |
| `getByDateRange(start, end)` | GET | `/outbound-emails/by-date-range` |
| `update()` | PATCH | `/outbound-emails` |
| `cancel(id)` | POST | `/outbound-emails/{id}/cancel` |
| `retry(id)` | POST | `/outbound-emails/{id}/retry` |
| `getRecords(id)` | GET | `/outbound-emails/{id}/records` |
| `delete(id)` | DELETE | `/outbound-emails/{id}` |
| `list()` | GET | `/outbound-emails` |
| `createBatch()` | POST | `/outbound-emails/batch` |

### OutboundSmsResource `/outbound-sms`
| Method | HTTP | Endpoint |
|--------|------|----------|
| `create()` | POST | `/outbound-sms` |
| `get(id)` | GET | `/outbound-sms/{id}` |
| `getByStatus(status)` | GET | `/outbound-sms/by-status` |
| `getByRecipient(phone)` | GET | `/outbound-sms/by-recipient` |
| `getByTemplate(id)` | GET | `/outbound-sms/by-template/{id}` |
| `getByDateRange(start, end)` | GET | `/outbound-sms/by-date-range` |
| `update()` | PATCH | `/outbound-sms` |
| `cancel(id)` | POST | `/outbound-sms/{id}/cancel` |
| `retry(id)` | POST | `/outbound-sms/{id}/retry` |
| `delete(id)` | DELETE | `/outbound-sms/{id}` |
| `list()` | GET | `/outbound-sms` |
| `createBatch()` | POST | `/outbound-sms/batch` |

### OutboundTemplatesResource `/outbound-templates`
| Method | HTTP | Endpoint |
|--------|------|----------|
| `createEmailTemplate()` | POST | `/outbound-templates/email` |
| `createSmsTemplate()` | POST | `/outbound-templates/sms` |
| `createWhatsappTemplate()` | POST | `/outbound-templates/whatsapp` |
| `get(id)` | GET | `/outbound-templates/{id}` |
| `getByCode(code)` | GET | `/outbound-templates/by-code/{code}` |
| `getByChannel(channel)` | GET | `/outbound-templates/by-channel/{channel}` |
| `getByTags(tags)` | GET | `/outbound-templates/by-tags` |
| `updateEmailTemplate()` | PATCH | `/outbound-templates/email` |
| `updateSmsTemplate()` | PATCH | `/outbound-templates/sms` |
| `updateWhatsappTemplate()` | PATCH | `/outbound-templates/whatsapp` |
| `activate(id)` | POST | `/outbound-templates/{id}/activate` |
| `deactivate(id)` | POST | `/outbound-templates/{id}/deactivate` |
| `render(id, variables)` | POST | `/outbound-templates/{id}/render` |
| `delete(id)` | DELETE | `/outbound-templates/{id}` |
| `list()` | GET | `/outbound-templates` |

### TranslationServicesResource `/translation-services`
| Method | HTTP | Endpoint |
|--------|------|----------|
| `initiate()` | POST | `/translation-services/initiate` |
| `create()` | POST | `/translation-services` |
| `get(id)` | GET | `/translation-services/{id}` |
| `getByOrganization(id)` | GET | `/translation-services/by-organization/{id}` |
| `getByProject(id)` | GET | `/translation-services/by-project/{id}` |
| `getByStatus(status)` | GET | `/translation-services/by-status` |
| `getByDateRange(start, end)` | GET | `/translation-services/by-date-range` |
| `update()` | PATCH | `/translation-services` |
| `updateStatus(id)` | PATCH | `/translation-services/{id}/status` |
| `end(id)` | POST | `/translation-services/{id}/end` |
| `generateSummary(id)` | POST | `/translation-services/{id}/generate-summary` |
| `getParticipants(id)` | GET | `/translation-services/{id}/participants` |
| `addParticipant(id)` | POST | `/translation-services/{id}/participants` |
| `updateParticipant(id)` | PATCH | `/translation-services/{id}/participants` |
| `removeParticipant(id, participantId)` | DELETE | `/translation-services/{id}/participants/{participantId}` |
| `delete(id)` | DELETE | `/translation-services/{id}` |
| `list()` | GET | `/translation-services` |

---

## Summary

- **Total Resource Classes:** 59+
- **Total Endpoints:** 528+
- **HTTP Methods:** GET, POST, PATCH, DELETE
- **Batch Operations:** 38+ batch endpoints
