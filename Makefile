NAME			= redmineIssues@UshakovVasilii_Github.yahoo.com
INSTALL_PATH	= $(HOME)/.local/share/gnome-shell/extensions

.SUFFIXES:

.PHONY: all install uninstall enable disable zip

all: install

$(INSTALL_PATH): $(NAME)
	rsync -ar --delete $< $@/
	
install: $(INSTALL_PATH)
	
uninstall:
	rm -rf $(INSTALL_PATH)
	
enable:
	gnome-extensions enable $(NAME)

disable:
	gnome-extensions disable $(NAME)

$(NAME).zip:
	cd $(NAME) && zip -r ../$@ *

zip: $(NAME).zip
	
