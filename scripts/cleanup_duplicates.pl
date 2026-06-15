#!/usr/bin/perl
use strict;
use warnings;
use File::Find;

# Headers that represent the new high-value action sections
my @action_headers = (
    "## Investor Action",
    "## Walking Action",
    "## Family Action",
    "## Practical Action",
    "## Tour Action"
);

# Headers containing these strings should be removed entirely
my @remove_patterns = (
    "Checklist",
    "체크리스트",
    "チェックリスト",
    "철학적 리플렉션"
);

sub process_file {
    my $file = $_;
    return unless $file =~ /\.md$/;
    
    my $filepath = $File::Find::name;
    
    open my $fh, '<', $file or die "Could not open $file: $!";
    my $content = do { local $/; <$fh> };
    close $fh;
    
    my $modified = 0;
    
    # 1. Remove sections with specific removal patterns
    foreach my $pattern_str (@remove_patterns) {
        my $pattern = qr/(?m)^## .*?\Q$pattern_str\E.*?\n.*?(?=\n## |\Z)/s;
        if ($content =~ s/$pattern//g) {
            print "Removed redundant section with pattern '$pattern_str' in $filepath\n";
            $modified = 1;
        }
    }
    
    # 2. Deduplicate Action sections
    foreach my $header (@action_headers) {
        # Match header line + content until next header or end
        my $pattern = qr/(?m)^\Q$header\E:.*?\n.*?(?=\n## |\Z)/s;
        my @matches = $content =~ /$pattern/g;
        
        if (scalar @matches > 1) {
            print "Found duplicates of $header in $filepath\n";
            # Keep only the LAST match (often the one added later is the most up-to-date in this specific workflow)
            my $last = $matches[-1];
            
            my @parts = split(/$pattern/, $content);
            # We want to keep $parts[0], then $last, then join the rest of $parts
            # Actually, the parts are the bits *between* matches.
            # So if we have 3 matches, we have 4 parts.
            # parts[0] match[0] parts[1] match[1] parts[2] match[2] parts[3]
            # We want to keep only one match.
            
            # Let's just find the first match's position and put the match there.
            my $new_content = $parts[0] . $last;
            for (my $i = 1; $i < @parts; $i++) {
                $new_content .= $parts[$i];
            }
            $content = $new_content;
            $modified = 1;
        }
    }
    
    if ($modified) {
        # Normalize spacing
        $content =~ s/\n{3,}/\n\n/g;
        
        open my $wh, '>', $file or die "Could not write to $file: $!";
        print $wh $content;
        close $wh;
        print "Processed $filepath\n";
    }
}

find(\&process_file, "src/data/blog");
