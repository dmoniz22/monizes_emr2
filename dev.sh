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

create_admin() {
    echo "Creating admin user (username: admin, password: admin123)..."
    podman exec oscar-mysql mysql -u root -poscar oscar -e "
        INSERT IGNORE INTO provider (provider_no, last_name, first_name, provider_type, specialty, sex, dob, status, lastUpdateDate)
        VALUES ('999998', 'Admin', 'System', 'doctor', 'Family Medicine', 'M', '1980-01-01', '1', NOW());
    " 2>/dev/null
    # Pre-generated BCrypt hash for 'admin123'
    podman exec oscar-mysql mysql -u root -poscar oscar -e "
        INSERT INTO security (user_name, password, provider_no, pin, b_ExpireSet, date_ExpireDate, b_LocalLockSet, b_RemoteLockSet, forcePasswordReset, totp_secret, totp_enabled)
        VALUES ('admin', '{bcrypt}\$2a\$10\$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '999998', '', 1, '2100-01-01', 1, 1, 0, '', 0)
        ON DUPLICATE KEY UPDATE password=VALUES(password);
    " 2>/dev/null
    echo "Admin user ready. Login at http://localhost:8080/oscar/"
    echo "  Username: admin"
    echo "  Password: admin123"
}

case "${1:-start}" in
    start)        start ;;
    stop)         stop ;;
    restart)      restart ;;
    build)        build ;;
    rebuild)      rebuild ;;
    db)           shift; db "$@" ;;
    create-admin) create_admin ;;
    *)            echo "Usage: source dev.sh [start|stop|restart|build|rebuild|db|create-admin]" ;;
esac
