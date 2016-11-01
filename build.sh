#!/bin/sh

# Make sure we are root
if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root" 1>&2
   exit 1
fi


workingdirs=(
./etc
./jrd-resource
./usb_conf
./usr)

echo ""
echo "Working dirs:"
for dir in "${workingdirs[@]}"; do
    echo "$((i++)) $dir"
done

echo ""
echo "Removing extented attributes from files"
for dir in "${workingdirs[@]}"; do
    xattr -c -r $dir
done

echo ""
echo "Removing MAC OS system files..."
# It still can't delete "com.apple.quarantine" attribute. I dont know why.
find . -name '.DS_Store' -type f -delete


# Set file owners to root
for dir in "${workingdirs[@]}"; do
    chown -R 0:0 $dir
done


# Check permissions and save it
echo ""
echo > permissions.txt
for dir in "${workingdirs[@]}"; do
    gfind $dir -printf '%m  %u:%g %p\n' | tee -a permissions.txt
done

# Archive files
echo ""
echo "Archiving files to patch.tgz"
# COPYFILE_DISABLE=1 need to ignore extended files attributes
COPYFILE_DISABLE=1 tar -cvzpf patch.tgz ${workingdirs[*]}


