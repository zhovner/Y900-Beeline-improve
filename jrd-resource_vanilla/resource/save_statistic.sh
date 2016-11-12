#! /bin/sh
#

new_file="$1"_new
old_file="$1"_old
 
if [  -f $new_file ]; then
  mv $new_file $old_file
fi

touch $new_file
echo "$2" > $new_file

exit 0
