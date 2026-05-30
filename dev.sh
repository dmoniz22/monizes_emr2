#!/bin/bash
# Oscar Development Scripts
# Usage: source dev.sh [start|stop|restart|build|rebuild]

OSCAR_HOME=/home/dmoniz/projects/oscar
CATALINA_HOME=/home/dmoniz/tomcat
CATALINA_BASE=$OSCAR_HOME/catalina_base
JAVA_HOME=$HOME/.sdkman/candidates/java/current

export CATALINA_HOME CATALINA_BASE JAVA_HOME
export JAVA_OPTS="-Xms1g -Xmx2g -XX:MaxMetaspaceSize=512m"
export MAVEN_OPTS="-Xmx2g"

start() {
    echo "Starting Oscar..."
    rm -rf $CATALINA_BASE/work/Catalina/localhost/oscar/ 2>/dev/null
    $CATALINA_HOME/bin/startup.sh
    echo "Waiting for startup..."
    for i in $(seq 1 15); do
        sleep 2
        HTTP=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/oscar/ 2>/dev/null)
        if [ "$HTTP" = "302" ] || [ "$HTTP" = "200" ]; then
            echo "Oscar ready at http://localhost:8080/oscar/"
            return 0
        fi
        echo -n "."
    done
    echo ""
    echo "Startup may have failed. Check $CATALINA_BASE/logs/catalina.out"
}

stop() {
    echo "Stopping Oscar..."
    $CATALINA_HOME/bin/shutdown.sh 2>/dev/null
    sleep 3
    kill $(lsof -ti:8080) 2>/dev/null || true
    echo "Stopped"
}

restart() {
    stop
    start
}

build() {
    echo "Building Oscar WAR..."
    cd $OSCAR_HOME
    mvn -Dmaven.test.skip=true -Dcheckstyle.skip=true -Dpmd.skip=true clean package
    echo "Build complete: $(ls -lh target/*.war)"
}

rebuild() {
    build
    restart
}

db() {
    podman exec -it oscar-mysql mysql -u root -poscar oscar "$@"
}

case "${1:-start}" in
    start)   start ;;
    stop)    stop ;;
    restart) restart ;;
    build)   build ;;
    rebuild) rebuild ;;
    db)      shift; db "$@" ;;
    *)       echo "Usage: source dev.sh [start|stop|restart|build|rebuild|db <sql>]" ;;
esac
