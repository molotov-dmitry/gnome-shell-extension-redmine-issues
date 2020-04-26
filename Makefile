NAME			= redmineIssues@UshakovVasilii_Github.yahoo.com
INSTALL_PATH	= $(HOME)/.local/share/gnome-shell/extensions

.SUFFIXES:

.PHONY: all install uninstall zip

all: install

$(INSTALL_PATH): $(NAME)
	rsync -ar --delete $< $@/
	
install: $(INSTALL_PATH)
	
uninstall:
	rm -rf $(INSTALL_PATH)

$(NAME).zip:
	cd $(NAME) && zip -r ../$@ *

zip: $(NAME).zip
	
