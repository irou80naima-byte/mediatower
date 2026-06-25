import fs from 'fs';
import path from 'path';
import readline from 'readline';
import mysql from 'mysql2/promise';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
  console.log('\n=== أداة تهيئة قاعدة بيانات Plan+B ===\n');
  console.log('يرجى إدخال بيانات الاتصال بقاعدة بيانات MySQL التي حصلت عليها من Aiven.io:\n');

  const host = await askQuestion('اسم المضيف (Host): ');
  const portInput = await askQuestion('المنفذ (Port) [الافتراضي 3306]: ');
  const port = parseInt(portInput || '3306', 10);
  const user = await askQuestion('اسم المستخدم (User) [الافتراضي avnadmin]: ') || 'avnadmin';
  const password = await askQuestion('كلمة المرور (Password): ');
  const database = await askQuestion('اسم قاعدة البيانات (Database Name) [الافتراضي defaultdb]: ') || 'defaultdb';

  rl.close();

  console.log('\nجاري الاتصال بقاعدة البيانات...');

  let connection;
  try {
    // الاتصال الأولي بدون تحديد قاعدة البيانات للتأكد من وجودها أو إنشائها
    connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      ssl: {
        rejectUnauthorized: false // مطلوب للاتصال الآمن بـ Aiven
      },
      multipleStatements: true
    });

    console.log('✅ تم الاتصال بنجاح!');

    // إنشاء قاعدة البيانات إذا لم تكن موجودة
    console.log(`جاري التأكد من وجود قاعدة البيانات "${database}"...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.query(`USE \`${database}\`;`);

    // قراءة ملف SQL
    const sqlPath = path.join(process.cwd(), 'myapp', 'database.sql');
    console.log(`جاري قراءة ملف قاعدة البيانات من: ${sqlPath}`);
    
    if (!fs.existsSync(sqlPath)) {
      throw new Error(`ملف database.sql غير موجود في المسار: ${sqlPath}`);
    }

    let sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // إزالة السطر "CREATE DATABASE IF NOT EXISTS myapp_db" و "USE myapp_db" لتجنب تعارض الأسماء مع Aiven
    sqlContent = sqlContent
      .replace(/CREATE DATABASE IF NOT EXISTS\s+\w+[^;]*;/gi, '')
      .replace(/USE\s+\w+[^;]*;/gi, '');

    console.log('جاري تهيئة الجداول في قاعدة البيانات...');
    await connection.query(sqlContent);
    
    console.log('\n🎉 تم استيراد قاعدة البيانات وإنشاء جميع الجداول بنجاح!');
  } catch (error) {
    console.error('\n❌ حدث خطأ أثناء الاتصال أو الاستيراد:');
    console.error(error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

main();
