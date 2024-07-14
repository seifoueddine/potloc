
FROM ruby:3.3.0-slim


WORKDIR /aldo_inventory


RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
    build-essential \
    git \
    libvips \
    pkg-config \
    libpq-dev


COPY Gemfile Gemfile.lock ./


RUN bundle install && \
    rm -rf ~/.bundle/ "${BUNDLE_PATH}"/ruby/*/cache "${BUNDLE_PATH}"/ruby/*/bundler/gems/*/.git && \
    bundle exec bootsnap precompile --gemfile


COPY . .


EXPOSE 3000


CMD ["rails", "server", "-b", "0.0.0.0"]
