include $(TOPDIR)/rules.mk

LUCI_TITLE:=LuCI Support for Podkop Watchdog
LUCI_DEPENDS:=+rpcd +luci-base
PKG_NAME:=luci-app-podkop-watchdog
PKG_VERSION:=9
PKG_RELEASE:=1

include $(INCLUDE_DIR)/package.mk
include $(INCLUDE_DIR)/luci.mk

define Package/$(PKG_NAME)/conffiles
/etc/config/podkop_watchdog
endef

# call BuildPackage - OpenWrt buildroot signature
$(eval $(call BuildPackage,$(PKG_NAME)))
