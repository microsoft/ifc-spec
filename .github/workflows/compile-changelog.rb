
# This script identifies the commits that have been made to the current
# branch since the release before this branch. It formats them according
# to a format specifier.
#
# Usage:
#   compile-changelog outfile
#
#   outfile: the file location to write the changelog to

module Git
  def self.one_line_format(repository_url)
    "[<code>%h</code>](#{repository_url}/commit/%h) %s (%an)"
  end

  def self.current_branch
    `git rev-parse --abbrev-ref HEAD`.strip
  end

  def self.default_branch
    `git rev-parse --abbrev-ref origin/HEAD`.strip
  end

  def self.default_branch_head
    `git rev-parse origin/HEAD`.strip
  end

  def self.initial_commit
    `git rev-list --max-parents=0 #{default_branch}`.strip
  end

  def self.release_branches
    `git branch --list -r origin/release/*`.split("\n").map(&:strip)
  end

  def self.commit_date(commit)
    `git show -s --format=%ct #{commit}`.strip
  end

  def self.merge_base_from(branch1, branch2)
    `git merge-base #{branch1} #{branch2}`.strip
  end

  # Returns the commit where the given branch forked from the default git branch.
  # If the given branch is the default git branch, the branch commit is the initial
  # commit in the repo.
  def self.merge_base(branch)
    if branch == Git::default_branch_head
      Git::initial_commit()
    else
      Git::merge_base_from(Git::default_branch, branch)
    end
  end

  def self.formatted_commits_between(low, high, format)
    `git log --pretty="format:#{format}" --no-merges #{low}..#{high}`
  end
end

outfile = ARGV[0]
repository_url = "https://github.com/#{ENV['GITHUB_REPOSITORY']}"
commit_upper_bound = Git::current_branch
commit_lower_bound = Git::release_branches
                      .map     { |branch| Git::merge_base(branch) }
                      .reject  { |commit| Git::commit_date(commit) >= Git::commit_date(commit_upper_bound) }
                      .sort_by { |commit| Git::commit_date(commit) }
                      .reverse
                      .first

changelog = Git::formatted_commits_between(
  commit_lower_bound || Git::initial_commit,
  commit_upper_bound,
  Git::one_line_format(repository_url))

File.open(outfile, 'a') do |file|
  file.puts changelog
end
